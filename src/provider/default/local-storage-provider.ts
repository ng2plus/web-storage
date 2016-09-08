import {StorageProvider} from '../storage-provider';
import {WindowStorageProvider} from '../window-storage-provider';

export class LocalStorageProvider extends WindowStorageProvider implements StorageProvider {
  protected providerName: string = 'localStorage';
}

export const localStorageProviderName = 'localStorage';