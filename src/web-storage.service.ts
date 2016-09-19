import {Injectable, Inject} from '@angular/core';
import {utils} from './utils';
import {WebStorage} from './web-storage';
import {WEB_STORAGE_SERVICE_CONFIG, WebStorageConfig, WebStorageEvent, WebStorageEventItem} from './web-storage.config';
import {
  LocalStorageProvider,
  localStorageProviderName,
  SessionStorageProvider,
  sessionStorageProviderName,
  StorageProvider
} from './providers';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {WS_ERROR} from './web-storage.messages';
import {checkStorage, addPrefixToKey} from './decorators';
import {DefaultWebStorageProvider} from './web-storage-type';
import {NOTIFY_OPTION} from './web-storage.config';
import {KeyValIterator} from './utils';

@Injectable()
export class WebStorageService {
  onError: ReplaySubject<number> = new ReplaySubject<number>(1);
  onSet: Subject<WebStorageEvent> = new Subject<WebStorageEvent>();
  onGet: Subject<WebStorageEvent> = new Subject<WebStorageEvent>();
  onRemove: Subject<WebStorageEvent> = new Subject<WebStorageEvent>();
  onRemoveAll: Subject<number> = new Subject<number>();

  private storage: WebStorage = null;
  private providers: {[index: string]: StorageProvider} = {};

  constructor(@Inject(WEB_STORAGE_SERVICE_CONFIG) private config: WebStorageConfig) {
    this.addDefaultProviders();
    this.init();
  }

  // @checkStorage(0) // basically it uses in this.keys()
  get length(): number {
    return this.keys().length;
  }

  addProvider(name: string, value: StorageProvider) {
    if (this.providers[name]) {
      return this.emitError(WS_ERROR.PROVIDER_EXISTS);
    }

    this.providers[name] = value;
  }

  useProvider(providerName: string|DefaultWebStorageProvider): void {
    this.storage = null;
    this.validateAndSetProvider(providerName).subscribe(<any>Function.prototype, err => this.emitError(err));
  }

  setup(config: WebStorageConfig) {
    this.config = utils.merge(this.config, config);
    this.init();
  }

  @checkStorage(null)
  @addPrefixToKey
  get<T>(key: string, defaultVal: any|KeyValIterator<any> = null): T {
    let item = this.getItem<T>(key, defaultVal);

    this.ifNotifyThenEmit(NOTIFY_OPTION.GET, this.makeEventItem(key, item));

    return item;
  }

  @checkStorage()
  @addPrefixToKey
  set(key: string, item: any, replacer?: KeyValIterator<any>) {
    let oldVal;

    try {
      this.ifNotifyThenDo(NOTIFY_OPTION.SET, () => oldVal = this.getItem(this.extractKey(key)));

      this.storage.setItem(key, JSON.stringify(item, replacer));

      this.ifNotifyThenEmit(NOTIFY_OPTION.SET, this.makeEventItem(key, item, oldVal));
    } catch (e) {
      this.onError.next(e.message);
    }
  }

  // @checkStorage // basically it uses in this.get()
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  @checkStorage() // despite it uses this.get we still need to check storage
  @addPrefixToKey
  remove<T>(key: string): T {
    let removed = this.get<T>(this.extractKey(key));

    this.storage.removeItem(key);
    this.ifNotifyThenEmit(NOTIFY_OPTION.REMOVE, this.makeEventItem(key, null, removed));

    return removed;
  }

  // @checkStorage // basically it uses in this.forEach()
  removeAll(): void {
    try {
      let count = 0;
      this.forEach((item: any, key: string) => this.remove(key) && ++count);

      this.ifNotifyThenDo(NOTIFY_OPTION.REMOVE_ALL, () => this.onRemoveAll.next(count));
    } catch(e) {
      this.onError.next(e.message);
    }
  }

  /**
   * Iterates over current storage object
   * @param fn
   * @param defaultVal
   */
  @checkStorage()
  forEach(fn: (item: any, key: string) => void, defaultVal: any = null): void {
    let keyStr;

    for (let key in this.storage) {
      if (key.startsWith(`${this.config.prefix}:`)) {
        keyStr = this.extractKey(key);
        fn(this.get(keyStr, defaultVal), keyStr);
      }
    }
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
      const subjectFn: Subject<WebStorageEvent> = this[fnName];

      if (!subjectFn) {
        return console.warn(`[Internal error]: method ${fnName} not found`);
      }

      subjectFn.next(this.createEventItem(this.extractKey(key), newValue, oldValue))
    }
  }

  private createEventItem(key: string, newVal: any, oldVal: any = null): WebStorageEvent {
    return Object.assign(this.makeEventItem(key, newVal, oldVal), {
      storageArea: this.storage
    });
  }

  private emitError(code: number): void {
    this.onError.next(code);
  }

  private init(): void {
    this.useProvider(this.config.provider);
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