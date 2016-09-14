import {DefaultWebStorageProvider} from './web-storage-type';
import {OpaqueToken} from '@angular/core';
import {WebStorage} from './web-storage';
import {utils} from './utils';

export const WEB_STORAGE_SERVICE_CONFIG = new OpaqueToken('WEB_STORAGE_SERVICE_CONFIG');

export const webStorageConfigDefault: WebStorageConfig = utils.dictionary<WebStorageConfig>({
  deserializeObjects: true,
  deserializeNumberLikeStrings: true,
  prefix: '__',
  provider: 'localStorage',
  notifyOn: {
    set: true,
    get: true,
    remove: true,
    update: false,
    removeAll: false
  }
});

// ############ INTERFACES ############

export interface WebStorageConfig {
  deserializeObjects?: boolean,
  deserializeNumberLikeStrings?: boolean,
  prefix?: string,
  provider?: DefaultWebStorageProvider,
  notifyOn?: NotifyOptions, // emit change, update, add, etc. events
}

export interface NotifyOptions {
  set?: boolean,
  get?: boolean,
  remove?: boolean,
  update?: boolean,
  removeAll?: boolean
}

export interface WebStorageEvent {
  key?: string;
  oldValue?: string;
  newValue?: string;
  storageArea?: WebStorage;
}