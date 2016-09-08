import {DefaultWebStorageProvider} from './web-storage-type';
import { OpaqueToken } from '@angular/core';

export const WEB_STORAGE_SERVICE_CONFIG = new OpaqueToken('WEB_STORAGE_SERVICE_CONFIG');

export const webStorageConfigDefault: WebStorageConfig = {
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
  },
  storeMetaData: true
};

// ############ INTERFACES ############

export interface WebStorageConfig {
  deserializeObjects?: boolean,
  deserializeNumberLikeStrings?: boolean,
  prefix?: string,
  provider?: DefaultWebStorageProvider/* | 'localForage'*/,
  notifyOn?: NotifyOptions, // emit change, update, add, etc. events
  storeMetaData?: boolean // to use features like deleteAll(prefix (default is what in config))
}

export interface NotifyOptions {
  set?: boolean,
  get?: boolean,
  remove?: boolean,
  update?: boolean,
  removeAll?: boolean
}
