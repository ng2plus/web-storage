import {Injectable, Inject} from '@angular/core';
import {utils} from './utils';
import {WebStorage} from './web-storage';
import {WEB_STORAGE_SERVICE_CONFIG, WebStorageConfig, WebStorageEvent} from './web-storage.config';
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

@Injectable()
export class WebStorageService {
  onError: ReplaySubject<number> = new ReplaySubject<number>(1);
  onSet: Subject<WebStorageEvent> = new Subject<WebStorageEvent>();
  onGet: Subject<WebStorageEvent> = new Subject<WebStorageEvent>();

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
    this.validateAndSetProvider(providerName).subscribe(utils.noop, err => this.emitError(err));
  }

  setup(config: WebStorageConfig) {
    this.config = utils.merge(this.config, config);
    this.init();
  }

  @checkStorage(null)
  @addPrefixToKey
  get<T>(key: string, defaultVal = null): T {
    let item = this.getItem<T>(key, defaultVal);

    this.ifNotifyThenDo('get', () => this.onGet.next(this.createEventItem(this.extractKey(key), item)));

    return item;
  }

  @checkStorage()
  @addPrefixToKey
  set(key: string, item: any) {
    let oldVal;

    try {
      this.ifNotifyThenDo('set', () => oldVal = this.getItem(this.extractKey(key)));

      this.storage.setItem(key, item);

      this.ifNotifyThenDo('set', () => this.onSet.next(this.createEventItem(this.extractKey(key), item, oldVal)));
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

    return removed;
  }

  // @checkStorage // basically it uses in this.forEach()
  removeAll(): void {
    this.forEach((item: any, key: string) => this.remove(key));
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

  private getItem<T>(prefixedKey: string, defaultVal = null): T {
    let item = this.storage.getItem(prefixedKey);

    return item === null ? defaultVal : item;
  }

  private ifNotifyThenDo(optionName: string, action: () => any) {
    if (this.config.notifyOn[optionName] === true) {
      action();
    }
  }

  private createEventItem(key: string, newValue: any, oldValue: any = null): WebStorageEvent {
    return {
      key,
      newValue,
      oldValue,
      storageArea: this.storage
    }
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