import {DefaultWebStorageProvider} from './web-storage-type';
import {OpaqueToken} from '@angular/core';
import {utils} from './utils';

export const NOTIFY_OPTION = {
  SET: 'set',
  GET: 'get',
  REMOVE: 'remove',
  REMOVE_ALL: 'removeAll'
};

export const WEB_STORAGE_SERVICE_CONFIG = new OpaqueToken('WEB_STORAGE_SERVICE_CONFIG');

export const webStorageConfigDefault: WebStorageConfig = utils.dictionary<WebStorageConfig>({
  // deserializeObjects: true, // if someone needs this, open an issue
  // deserializeNumberLikeStrings: true, // if someone needs this, open an issue
  prefix: '__',
  provider: 'localStorage',
  notifyOn: {
    [NOTIFY_OPTION.SET]: true,
    [NOTIFY_OPTION.GET]: true,
    [NOTIFY_OPTION.REMOVE]: true,
    [NOTIFY_OPTION.REMOVE_ALL]: true
  }
});

// ############ INTERFACES ############

export interface WebStorageConfig {
  deserializeObjects?: boolean,
  deserializeNumberLikeStrings?: boolean,
  prefix?: string,
  provider?: DefaultWebStorageProvider|string,
  notifyOn?: NotifyOptions, // emit change, update, add, etc. events
}

export interface NotifyOptions {
  set?: boolean,
  get?: boolean,
  remove?: boolean,
  update?: boolean,
  removeAll?: boolean
}

export interface WebStorageEvent extends WebStorageEventItem {
  url?: string;
  provider?: string;
}

export interface WebStorageEventItem {
    key?: string;
    oldValue?: string;
    newValue?: string;
}