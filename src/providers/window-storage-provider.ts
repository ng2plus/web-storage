import {StorageProvider} from './storage-provider';
import {WebStorage} from '../web-storage';
import {Observable} from 'rxjs';

export abstract class WindowStorageProvider implements StorageProvider {
  protected abstract providerName: string;

  get(): WebStorage {
    return <WebStorage>window[this.providerName];
  }

  validate(): Observable<WebStorage> {
    return new Observable<WebStorage>(observer => {
      if (!this.isGlobal()) {
        observer.error(`${localStorage} is for usage in browser environment only`);
      }

      if (!this.isWritable()) {
        observer.error(`${localStorage} is not writable. Probably you are in incognito mode or the ${localStorage}'s quota exceed`);
      }

      observer.next(this.get());
      observer.complete();
    });
  }

  private isGlobal(): boolean {
    return this.providerName in window;
  }

  private isWritable(): boolean {
    try {
      const storage = window.localStorage,
        x = `__test_${this.providerName}__`;

      storage.setItem(x, x);
      storage.removeItem(x);

      return true;
    }
    catch (e) {
      return false;
    }
  }
}