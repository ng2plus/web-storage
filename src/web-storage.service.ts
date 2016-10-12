import {Injectable, Inject} from '@angular/core';
import {KeyValIterator, utils} from './utils';
import {WebStorage} from './web-storage';
import {
  WEB_STORAGE_SERVICE_CONFIG,
  WebStorageConfig,
  WebStorageEvent,
  WebStorageEventItem,
  webStorageConfigDefault
} from './web-storage.config';
import {
  LocalStorageProvider,
  localStorageProviderName,
  SessionStorageProvider,
  sessionStorageProviderName,
  StorageProvider
} from './providers';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Subject} from 'rxjs/Subject';
import {WS_ERROR} from './web-storage.messages';
import {checkStorage, addPrefixToKey} from './decorators';
import {DefaultWebStorageProvider} from './web-storage-type';
import {NOTIFY_OPTION} from './web-storage.config';

declare const BroadcastChannel;

@Injectable()
export class WebStorageService {
  onError: ReplaySubject<number> = new ReplaySubject<number>(1);
  onSet: Subject<WebStorageEventItem> = new Subject<WebStorageEventItem>();
  onGet: Subject<WebStorageEventItem> = new Subject<WebStorageEventItem>();
  onRemove: Subject<WebStorageEventItem> = new Subject<WebStorageEventItem>();
  onRemoveAll: Subject<number> = new Subject<number>();
  onMessage: Subject<WebStorageEvent> = new Subject<WebStorageEvent>();

  private channel: any = null;
  private storage: WebStorage = null;
  private providers: {[index: string]: StorageProvider} = {};

  constructor(@Inject(WEB_STORAGE_SERVICE_CONFIG) private config: WebStorageConfig) {
    this.mergeConfig(webStorageConfigDefault, config);
    this.addDefaultProviders();
    this.init();
  }

  // @checkStorage(0) // basically it uses in this.keys()
  get length(): number {
    return this.keys().length;
  }

  get asPromise() {
    const set = (key: string, replacer?: KeyValIterator<any>): (item: any) => Promise<any> => {
      return (item: any) => utils.promisifyFn(this.set, [key, item, replacer], this).then($0 => item);
    };

    const get = <T>(key: string, defaultVal: any|KeyValIterator<any> = null): () => Promise<T> => {
      return () => utils.promisifyFn(this.get, [key, defaultVal], this);
    };

    const pull = <T>(key: string, defaultVal: any|KeyValIterator<any> = null): () => Promise<T> => {
      return () => utils.promisifyFn(this.pull, [key, defaultVal], this);
    };

    const keys = (): () => Promise<string[]> => () => utils.promisifyFn(this.keys, null, this);

    const getAll = (): () => Promise<StorageDictionary> => () => utils.promisifyFn(this.getAll, null, this);

    const remove = <T>(key: string): () => Promise<T> => {
      return () => utils.promisifyFn(this.remove, [key], this);
    };

    const removeAll = (): () => Promise<WebStorageService> => () => utils.promisifyFn(this.removeAll, null, this);

    return {set, get, remove, removeAll, pull, keys, getAll};
  }

  addProvider(name: string, value: StorageProvider, useIt = false): WebStorageService {
    if (this.providers[name]) {
      return this.emitError(WS_ERROR.PROVIDER_EXISTS), this;
    }

    this.providers[name] = value;

    if (useIt) this.useProvider(name);

    return this;
  }

  useProvider(providerName: string|DefaultWebStorageProvider): WebStorageService {
    this.storage = null;
    this.validateAndSetProvider(providerName).subscribe(<any>Function.prototype, err => this.emitError(err));

    return this;
  }

  // TODO instance(config: WebStorageConfig): WebStorageService {}

  // TODO untested
  setup(config: WebStorageConfig): WebStorageService {
    this.mergeConfig(this.config, config);
    this.init();

    return this;
  }

  @checkStorage(null)
  @addPrefixToKey
  // TODO untested KeyValIterator
  get<T>(key: string, defaultVal: any|KeyValIterator<any> = null): T {
    let item = this.getItem<T>(key, defaultVal);

    this.ifNotifyThenEmit(NOTIFY_OPTION.GET, this.makeEventItem(key, item));

    return item;
  }

  @checkStorage()
  @addPrefixToKey
  // TODO untested KeyValIterator
  set(key: string, item: any, replacer?: KeyValIterator<any>): WebStorageService {
    let oldVal;

    try {
      this.ifNotifyThenDo(NOTIFY_OPTION.SET, () => oldVal = this.getItem(this.extractKey(key)));

      this.storage.setItem(key, JSON.stringify(item, replacer));

      this.ifNotifyThenEmit(NOTIFY_OPTION.SET, this.makeEventItem(key, item, oldVal));
    } catch (e) {
      this.onError.next(e.message);
    }

    return this;
  }

  @checkStorage(null)
  @addPrefixToKey
  pull<T>(key: string, defaultVal: any|KeyValIterator<any> = null): T {
    let item = this.getItem<T>(key, defaultVal);

    this.remove(this.extractKey(key));

    this.ifNotifyThenEmit(NOTIFY_OPTION.GET, this.makeEventItem(key, item));

    return item;
  }

  // @checkStorage // basically it uses in this.get()
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  @checkStorage()
  @addPrefixToKey
  remove<T>(key: string): T {
    let removed = this.getItem<T>(key);

    this.storage.removeItem(key);
    this.ifNotifyThenEmit(NOTIFY_OPTION.REMOVE, this.makeEventItem(key, null, removed));

    return removed;
  }

  // @checkStorage // basically it uses in this.forEach()
  // TODO probably emits when the last item is removed from the storage
  removeAll(): WebStorageService {
    try {
      let count = 0;
      this.forEach((item: any, key: string) => this.remove(key) && ++count);

      this.ifNotifyThenDo(NOTIFY_OPTION.REMOVE_ALL, () => this.onRemoveAll.next(count));
    } catch(e) {
      this.onError.next(e.message); // TODO emit an object {code, message}
    }

    return this;
  }

  /**
   * Iterates over current storage object
   * @param fn
   * @param defaultVal
   */
  @checkStorage()
  forEach(fn: (item: any, key: string) => void, defaultVal: any = null): WebStorageService {
    let keyStr;

    for (let key in this.storage) {
      if (key.startsWith(`${this.config.prefix}:`)) {
        keyStr = this.extractKey(key);
        fn(this.get(keyStr, defaultVal), keyStr);
      }
    }

    return this;
  }

  // @checkStorage // basically it uses in this.forEach()
  keys(): string[] {
    const keys = [];

    return this.forEach((item: any, key: string) => keys.push(key)), keys;
  }

  // @checkStorage // basically it uses in this.forEach()
  getAll(): StorageDictionary {
    const all: StorageDictionary = {};

    this.forEach((item: any, key: string) => {
      all[key] = item;
    });

    return all;
  }

  // TODO can just single notification option be updated?
  private mergeConfig(defaultConfig, newConfig) {
    this.config = utils.merge(defaultConfig, newConfig);
  }

  private getItem<T>(prefixedKey: string, defaultVal: any|KeyValIterator<any> = null): T {
    let parseBound = JSON.parse.bind(JSON, this.storage.getItem(prefixedKey));

    if (typeof defaultVal === 'function') {
      return parseBound(defaultVal);
    }

    const item = parseBound();

    return item === null ? defaultVal : item;
  }

  private ifNotifyThenDo(optionName: string, action: () => any) {
    if (this.config.notifyOn[optionName] === true) {
      action();
    }
  }

  private makeEventItem(key: string, newValue: any, oldValue?: any): WebStorageEventItem {
    return {key, newValue, oldValue};
  }

  private ifNotifyThenEmit(optionName: string, {key, newValue, oldValue}: WebStorageEventItem) {
    if (this.config.notifyOn[optionName] === true) {
      const fnName = `on${utils.capitalize(optionName)}`;
      const subjectFn: Subject<WebStorageEventItem> = this[fnName];

      if (!subjectFn) {
        return console.warn(`[Internal error]: method ${fnName} not found`);
      }

      const eventItem = this.createEventItem(this.extractKey(key), newValue, oldValue);

      subjectFn.next(eventItem);

      if (this.channel && [NOTIFY_OPTION.SET, NOTIFY_OPTION.REMOVE, NOTIFY_OPTION.REMOVE_ALL].includes(optionName)) {
        this.channel.postMessage(<WebStorageEvent>Object.assign(eventItem, {
          url: location.href,
          provider: this.config.provider
        }));
      }
    }
  }

  private createEventItem(key: string, newVal: any, oldVal: any = null): WebStorageEventItem {
    return this.makeEventItem(key, newVal, oldVal);
  }

  private emitError(code: number): void {
    this.onError.next(code);
  }

  private init(): void {
    this.initBroadcast();
    this.useProvider(this.config.provider);
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API
   */
  private initBroadcast() {
    if ('BroadcastChannel' in window) {
      const channelName = `ng2plus:webstorage:${this.config.provider}`;

      this.channel = new BroadcastChannel(channelName);
      this.channel.onmessage = (event: {data: WebStorageEvent}) => {
        this.onMessage.next(event.data);
      }
    }
  }

  private addDefaultProviders() {
    this.addProvider(localStorageProviderName, new LocalStorageProvider());
    this.addProvider(sessionStorageProviderName, new SessionStorageProvider());
  }

  private prefixKey(str: string): string {
    return `${this.config.prefix}:${str}`;
  }

  private extractKey(key: string): string {
    return key.substr(`${this.config.prefix}:`.length);
  }

  private validateProvider(providerName: string): Observable<WebStorage> {
    if (!this.providers[providerName]) {
      return Observable.throw(WS_ERROR.UNKNOWN_PROVIDER);
    }

    return this.providers[providerName].validate();
  }

  private setProvider(storage: WebStorage): WebStorage {
    return this.storage = storage;
  }

  private validateAndSetProvider(providerName: string): Observable<WebStorage> {
    return this.validateProvider(providerName)
      .map(provider => this.setProvider(provider));
  }
}

export interface StorageDictionary {
  [index: string]: any;
}