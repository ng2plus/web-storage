import {StorageProvider} from '../storage-provider';
import {WindowStorageProvider} from '../window-storage-provider';

export class SessionStorageProvider extends WindowStorageProvider implements StorageProvider {
  protected providerName: string = 'sessionStorage';
}

export const sessionStorageProviderName = 'sessionStorage';