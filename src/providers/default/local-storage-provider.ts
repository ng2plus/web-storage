import {StorageProvider} from '../storage-provider';
import {WindowStorageProvider} from '../window-storage-provider';

export const localStorageProviderName = 'localStorage';

export class LocalStorageProvider extends WindowStorageProvider implements StorageProvider {
  protected providerName: string = localStorageProviderName;
}
