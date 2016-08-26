let storageConfigDefault: StorageConfig = {
  deserializeObjects: true,
  deserializeNumberLikeStrings: true,
  prefix: '::',
  storageProvider: 'localStorage',
  notifyOn: {
    set: true,
    get: true,
    remove: true,
    update: false,
    removeAll: false
  },
  storeMetaData: true
};

export const storageConfig = Object.seal(storageConfigDefault);

export interface StorageConfig {
  deserializeObjects?: boolean,
  deserializeNumberLikeStrings?: boolean,
  prefix?: string,
  storageProvider?: 'localStorage' | 'sessionStorage'/* | 'localForage'*/,
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
