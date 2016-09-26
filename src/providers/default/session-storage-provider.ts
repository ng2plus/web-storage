import {StorageProvider} from '../storage-provider';
import {WindowStorageProvider} from '../window-storage-provider';

export const sessionStorageProviderName = 'sessionStorage';

export class SessionStorageProvider extends WindowStorageProvider implements StorageProvider {
  protected providerName: string = sessionStorageProviderName;
}
