import {Injectable} from '@angular/core';
import {storageConfig, StorageConfig} from './config/storage-config';
import {utils} from './utils';
import {WebStorage} from './web-storage';
import {WebStorageValidator} from './web-storage.validator';

@Injectable()
export class WebStorageService {
  private config: StorageConfig = storageConfig;
  private storage: WebStorage;

  constructor(private validator: WebStorageValidator) {
    this.init();
  }

  setup(config: StorageConfig) {
    utils.defaults(this.config, config);
    this.init();
  }

  get length(): number {
    return this.keys().length;
  }

  @prefixedKey
  get<T>(key: string, defaultVal = null): T {
    let item = this.storage.getItem(key);

    return item === null ? defaultVal : item;
  }

  @prefixedKey
  set(key: string, item: any) {
    this.storage.setItem(key, item);
  }

  @prefixedKey
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  @prefixedKey
  remove<T>(key: string): T {
    let removed = this.get<T>(key);

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
        keyStr = this.fromKey(key);
        fn(this.get(keyStr, defaultVal), keyStr);
      }
    }
  }

  keys(): string[] {
    const keys = [];

    return this.forEach((item: any, key: string) => {keys.push(this.fromKey(key))}), keys;
  }

  private init(): void {
    this.validator.isAvailable(this.config.storageProvider);
    this.storage = this.getStorageInstance();
  }

  private getStorageInstance(): WebStorage {
    if (this.config.storageProvider === 'localStorage') {
      return <WebStorage>window.localStorage;
    }

    if (this.config.storageProvider === 'localStorage') {
      return <WebStorage>window.sessionStorage;
    }

    throw new TypeError('Unknown storage provider');
  }

  private toKey(str: string): string {
    return `${this.config.prefix}:${str}`;
  }

  private fromKey(key: string): string {
    return key.substr(`${this.config.prefix}:`.length);
  }
}

function prefixedKey(target: Object, key: string, value: any) {
  return {
    value: function(key: string, ...args: any[]) {
      return value.value.call(this, this.toKey(key), ...args);
    }
  }
}
