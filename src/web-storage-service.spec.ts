import {WebStorageService} from './web-storage.service';
import {WEB_STORAGE_SERVICE_CONFIG, webStorageConfigDefault, WebStorageEvent} from './web-storage.config';
import {TestBed, inject, async} from '@angular/core/testing';
import {ReplaySubject, Observable, Subject} from 'rxjs';
import {WS_ERROR} from './web-storage.messages';
import {StorageProvider} from './providers/storage-provider';
import {WebStorage} from './web-storage';
import {LocalStorageProvider} from './providers/default/local-storage-provider';

describe('WebStorage Providers', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      WebStorageService,
      {provide: WEB_STORAGE_SERVICE_CONFIG, useValue: webStorageConfigDefault}
    ]
  }));

  it(`should switch between default providers`,
    async(inject([WebStorageService], (storage: WebStorageService) => {
      expect(storage.onError).toEqual(jasmine.any(ReplaySubject));

      let spies = {
          onErrorFn() {}
        };

      spyOn(spies, 'onErrorFn').and.callThrough();
      storage.onError.subscribe(spies.onErrorFn);

      storage.useProvider('localStorage');
      storage.useProvider('sessionStorage');

      expect(spies.onErrorFn).toHaveBeenCalledTimes(0);
    }))
  );

  it(`should not add duplicate provider`,
    async(inject([WebStorageService], (storage: WebStorageService) => {
      expect(storage.onError).toEqual(jasmine.any(ReplaySubject));

      let spies = {
          onErrorFn(val) {
            expect(val).toBe(WS_ERROR.PROVIDER_EXISTS);
          }
        };

      spyOn(spies, 'onErrorFn').and.callThrough();
      storage.onError.subscribe(spies.onErrorFn);

      storage.addProvider('localStorage', new LocalStorageProvider());

      expect(spies.onErrorFn).toHaveBeenCalledTimes(1);
    }))
  );

  it(`should add and use new provider`,
    async(inject([WebStorageService], (storage: WebStorageService) => {
      expect(storage.onError).toEqual(jasmine.any(ReplaySubject));

      let spies = {
          onErrorFn() {}
        };

      spyOn(spies, 'onErrorFn').and.callThrough();
      storage.onError.subscribe(spies.onErrorFn);

      storage.addProvider('cookie', new (class CookieProvider implements StorageProvider {
        get(): WebStorage {
          return <WebStorage>{};
        }

        validate(): Observable<WebStorage> {
          return Observable.empty<WebStorage>();
        }
      })());
      storage.useProvider('cookie');

      expect(spies.onErrorFn).toHaveBeenCalledTimes(0);
    }))
  );
});

describe('WebStorage Service Interface', () => {
  let testKey = 'key',
    testKey2 = 'key2',
    testKey3 = 'key3',
    testVal = 'val',
    testVal2 = 'val2',
    testVal3 = 'val3',
    overrideVal = 'oVal',
    testObjKey = 'valO',
    testObjVal = {a: 'test'};

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      WebStorageService,
      {provide: WEB_STORAGE_SERVICE_CONFIG, useValue: webStorageConfigDefault}
    ]
  }));

  // afterEach(() => inject([WebStorageService], (storage: WebStorageService) => {
  //   storage.removeAll();
  // }));

  it(`should be empty`,
    inject([WebStorageService], (storage: WebStorageService) => {
      expect(storage.length).toEqual(0);
    })
  );

  it(`should be 'null' when trying to get the key that doesn't exists`, (
    inject([WebStorageService], (storage: WebStorageService) => {
      expect(storage.get(testKey)).toBeNull();
    })
  ));

  it(`should set value`, (
    inject([WebStorageService], (storage: WebStorageService) => {
      spyOn(storage, 'set').and.callThrough();

      // set single value
      storage.set(testKey, testVal);

      // set object
      storage.set(testObjKey, testObjVal);

      expect(storage.set).toHaveBeenCalled();
      expect(storage.get(testKey)).toBe(testVal);
      expect(storage.get(testObjKey)).toEqual(testObjVal);

      storage.remove(testObjKey);
    })
  ));

  it(`should override the value`, (
    inject([WebStorageService], (storage: WebStorageService) => {
      storage.set(testKey, overrideVal);

      expect(storage.get(testKey)).toBe(overrideVal);

      storage.set(testKey, testVal);
    })
  ));

  it(`should get keys and value(s)`, (
    inject([WebStorageService], (storage: WebStorageService) => {
      storage.set(testKey, testVal);
      storage.set(testKey2, testVal2);
      storage.set(testObjKey, testObjVal);

      // get single value
      expect(storage.get(testKey)).toBe(testVal);

      // pull value (and remove)
      expect(storage.pull(testObjKey)).toEqual(testObjVal);

      // get all items
      expect(storage.getAll()).toEqual({
        [testKey]: testVal,
        [testKey2]: testVal2
      });

      // get all keys
      expect(storage.keys()).toEqual([testKey, testKey2]);
    })
  ));

  it(`should get items length`,
    inject([WebStorageService], (storage: WebStorageService) => {
      storage.set(testKey3, testVal3);

      expect(storage.length).toBe(3);
    })
  );

  it(`should remove two item`,
    inject([WebStorageService], (storage: WebStorageService) => {
      expect(storage.remove(testKey)).toBe(testVal);
      expect(storage.remove(testKey2)).toBe(testVal2);
      expect(storage.length).toBe(1);
    })
  );

  it(`should remove all items`,
    inject([WebStorageService], (storage: WebStorageService) => {
      spyOn(storage, 'removeAll').and.callThrough();

      storage.removeAll();

      expect(storage.removeAll).toHaveBeenCalled();
      expect(storage.length).toEqual(0);
    })
  );

});

describe('WebStorage Service event', () => {
  let testKey = 'key',
    testVal = 'val',
    testKey2 = 'key2',
    testVal2 = 'val2';

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      WebStorageService,
      {provide: WEB_STORAGE_SERVICE_CONFIG, useValue: webStorageConfigDefault}
    ]
  }));

  it(`'onError' fires`,
    async(inject([WebStorageService], (storage: WebStorageService) => {
      expect(storage.onError).toEqual(jasmine.any(ReplaySubject));

      enum ACTION {
        USE_UNKNOWN_PROVIDER,
        USE_API_WHEN_PROVIDER_NOT_SET
      }

      let current: ACTION,
        spies = {
          onErrorFn(val) {
            switch(current) {
              case ACTION.USE_UNKNOWN_PROVIDER: {
                expect(val).toBe(WS_ERROR.UNKNOWN_PROVIDER); break;
              }
              case ACTION.USE_API_WHEN_PROVIDER_NOT_SET:
              default: {
                expect(val).toBe(WS_ERROR.PROVIDER_NOT_SET); break;
              }
            }
          }
        };

      spyOn(spies, 'onErrorFn').and.callThrough();

      storage.onError.subscribe(spies.onErrorFn);

      // #1
      current = ACTION.USE_UNKNOWN_PROVIDER;
      storage.useProvider('unknown_provider');

      // #2
      current = ACTION.USE_API_WHEN_PROVIDER_NOT_SET;
      storage.set(testKey, testVal);
      void storage.length;
      storage.get(testKey);
      storage.has(testKey);
      storage.remove(testKey);
      storage.removeAll();
      storage.forEach(() => {});
      storage.keys();
      storage.getAll();

      expect(spies.onErrorFn).toHaveBeenCalledTimes(10);
    }))
  );

  it(`'onSet' fires`,
    async(inject([WebStorageService], (storage: WebStorageService) => {
      expect(storage.onSet).toEqual(jasmine.any(Subject));

      let spies = {
          onSetFn(val: WebStorageEvent) {
            expect(val.key).toEqual(testKey);
            expect(val.newValue).toEqual(testVal);
            expect(val.oldValue).toBeNull();
            expect(val.storageArea).not.toBeNull();
          }
        };

      spyOn(spies, 'onSetFn').and.callThrough();

      storage.onSet.subscribe(spies.onSetFn);

      storage.set(testKey, testVal);

      expect(spies.onSetFn).toHaveBeenCalledTimes(1);
    }))
  );

  it(`'onGet' fires`,
    async(inject([WebStorageService], (storage: WebStorageService) => {
      expect(storage.onGet).toEqual(jasmine.any(Subject));

      let spies = {
          onGetFn(val: WebStorageEvent) {
            expect(val.key).toEqual(testKey);
            expect(val.newValue).toEqual(testVal);
            expect(val.oldValue).toBeNull();
            expect(val.storageArea).not.toBeNull();
          }
        };

      spyOn(spies, 'onGetFn').and.callThrough();

      storage.onGet.subscribe(spies.onGetFn);

      storage.set(testKey, testVal);
      storage.get(testKey);

      expect(spies.onGetFn).toHaveBeenCalledTimes(1);
    }))
  );

  it(`'onRemove' fires`,
    async(inject([WebStorageService], (storage: WebStorageService) => {
      expect(storage.onRemove).toEqual(jasmine.any(Subject));

      let spies = {
          subscribeFn(val: WebStorageEvent) {
            expect(val.key).toEqual(testKey);
            expect(val.newValue).toBeNull();
            expect(val.oldValue).toEqual(testVal);
            expect(val.storageArea).not.toBeNull();
          }
        };

      spyOn(spies, 'subscribeFn').and.callThrough();

      storage.onRemove.subscribe(spies.subscribeFn);

      storage.set(testKey, testVal);
      storage.remove(testKey);

      expect(spies.subscribeFn).toHaveBeenCalledTimes(1);
    }))
  );

  it(`'onGet' and 'onRemove' fires`,
    async(inject([WebStorageService], (storage: WebStorageService) => {
      let spies = {
          onGetFn(val: WebStorageEvent) {
            expect(val.key).toEqual(testKey);
            expect(val.newValue).toEqual(testVal);
            expect(val.oldValue).toBeNull();
            expect(val.storageArea).not.toBeNull();
          },
          onRemoveFn(val: WebStorageEvent) {
            expect(val.key).toEqual(testKey);
            expect(val.newValue).toBeNull();
            expect(val.oldValue).toEqual(testVal);
            expect(val.storageArea).not.toBeNull();
          }
        };

      spyOn(spies, 'onGetFn').and.callThrough();
      spyOn(spies, 'onRemoveFn').and.callThrough();

      storage.onGet.subscribe(spies.onGetFn);
      storage.onRemove.subscribe(spies.onRemoveFn);

      storage.set(testKey, testVal);
      storage.pull(testKey);

      expect(spies.onGetFn).toHaveBeenCalledTimes(1);
      expect(spies.onRemoveFn).toHaveBeenCalledTimes(1);
    }))
  );

  it(`'onRemoveAll' fires`,
    async(inject([WebStorageService], (storage: WebStorageService) => {
      expect(storage.onRemoveAll).toEqual(jasmine.any(Subject));

      let spies = {
          subscribeFn(val: number) {
            expect(val).toEqual(2);
          }
        };

      spyOn(spies, 'subscribeFn').and.callThrough();

      storage.onRemoveAll.subscribe(spies.subscribeFn);

      storage.set(testKey, testVal);
      storage.set(testKey2, testVal2);
      storage.removeAll();

      expect(spies.subscribeFn).toHaveBeenCalledTimes(1);
    }))
  );

  it(`(service) should remove all items`,
    inject([WebStorageService], (storage: WebStorageService) => {
      storage.removeAll();
    })
  );
});