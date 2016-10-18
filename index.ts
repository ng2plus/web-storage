/**
 * Exports public API
 */

import {WebStorageService} from './src/web-storage.service';
import {WebStoragePipe} from './src/web-storage.pipe';

export const WEB_STORAGE_DECLARATIONS = [WebStoragePipe];

export {WebStorageService, StorageDictionary} from './src/web-storage.service';
export {
  WEB_STORAGE_SERVICE_CONFIG,
  webStorageConfigDefault,
  WebStorageConfig,
  WebStorageEvent,
  WebStorageEventItem,
  NOTIFY_OPTION
} from './src/web-storage.config';
export {WebStorage} from './src/web-storage';
export {StorageProvider} from './src/providers';
export {WS_ERROR} from './src/web-storage.messages';
export {WebStoragePipe} from './src/web-storage.pipe';

export default WebStorageService;