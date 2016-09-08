import {Injectable, Inject, EventEmitter} from '@angular/core';
import {utils} from './utils';
import {WebStorage} from './web-storage';
import {WEB_STORAGE_SERVICE_CONFIG, WebStorageConfig} from './web-storage.config';
import {LocalStorageProvider, localStorageProviderName} from './provider/default/local-storage-provider';
import {StorageProvider} from './provider/storage-provider';
import {SessionStorageProvider, sessionStorageProviderName} from './provider/default/session-storage-provider';
import {Observable, ReplaySubject} from 'rxjs';

@Injectable()
export class WebStorageService {
  onError: ReplaySubject<string> = new ReplaySubject<string>(1);

  private storage: WebStorage;
  private providers: {[index: string]: StorageProvider} = {};

  constructor(@Inject(WEB_STORAGE_SERVICE_CONFIG) private config: WebStorageConfig) {
    this.addDefaultProviders();
    this.init();
  }

  get length(): number {
    return this.keys().length;
  }

  addProvider(name: string, value: StorageProvider) {
    this.providers[name] = value;
  }

  useProvider(providerName: string): void {
    this.validateProvider(providerName).subscribe(utils.noop, err => this.onError.next(err));
  }

  private validateProvider(providerName: string): Observable<WebStorage> {
    if (!this.providers[providerName]) {
      return Observable.throw(`Unknown provider`); // TODO change to error constants
    }

    return this.providers[providerName].validate().map(storage => this.storage = storage);
  }

  setup(config: WebStorageConfig) {
    this.config = utils.merge(this.config, config);
    this.init();
  }

  @addPrefixToKey
  get<T>(key: string, defaultVal = null): T {
    let item = this.storage.getItem(key);

    return item === null ? defaultVal : item;
  }

  @addPrefixToKey
  set(key: string, item: any) {
    this.storage.setItem(key, item);
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  @addPrefixToKey
  remove<T>(key: string): T {
    let removed = this.get<T>(this.extractKey(key));

    this.storage.removeItem(key);

    return removed;
  }

  removeAll(): void {
    this.forEach((item: any, key: string) => this.remove(key));
  }

  /**
   * Iterates over current storage object
   * @param fn
   * @param defaultVal
   */
  forEach(fn: (item: any, key: string) => void, defaultVal: any = null): void {
    let keyStr;

    for (let key in this.storage) {
      if (key.startsWith(`${this.config.prefix}:`)) {
        keyStr = this.extractKey(key);
        fn(this.get(keyStr, defaultVal), keyStr);
      }
    }
  }

  keys(): string[] {
    const keys = [];

    return this.forEach((item: any, key: string) => {keys.push(key)}), keys;
  }

  getAll(): StorageDictionary {
    const all: StorageDictionary = {};

    this.forEach((item: any, key: string) => {
      all[key] = item;
    });

    return all;
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
}

function addPrefixToKey(target: Object, key: string, value: any) {
  return {
    value: function(key: string, ...args: any[]) {
      return value.value.call(this, this.prefixKey(key), ...args);
    }
  }
}

export interface StorageDictionary {
  [index: string]: any;
}