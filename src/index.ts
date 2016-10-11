import {WebStorageService} from './web-storage.service';

export {WebStorageService, StorageDictionary} from './web-storage.service';
export {
  WEB_STORAGE_SERVICE_CONFIG,
  webStorageConfigDefault,
  WebStorageConfig,
  WebStorageEvent,
  WebStorageEventItem,
  NOTIFY_OPTION
} from './web-storage.config';
export {WebStorage} from './web-storage';
export {StorageProvider} from './providers';
export {WS_ERROR} from './web-storage.messages';

export default WebStorageService;