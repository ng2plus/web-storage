import {Injectable} from '@angular/core';
import {DefaultWebStorageType} from './web-storage-type';

@Injectable()
export class WebStorageValidator {
  isAvailable(storageType: DefaultWebStorageType): boolean {
    switch (storageType) {
      case 'sessionStorage':
      case 'localStorage':
      default: {
        return this.isLocalStorageAvailable();
      }
    }
  }

  /**
   * Detects whether `localStorage` is both supported and available
   * @see https://developer.mozilla.org/ru/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
   * @returns {boolean}
   */
  private isLocalStorageAvailable(): boolean {
    try {
      const storage = window.localStorage,
        x = '__storage_test__';

      storage.setItem(x, x);
      storage.removeItem(x);

      return true;
    }
    catch(e) {
      return false;
    }
  }
}
