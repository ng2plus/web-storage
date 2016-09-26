import {TestBed, inject, async} from '@angular/core/testing';
import {ReplaySubject, Observable, Subject} from 'rxjs';
import {
  WS_ERROR,
  WebStorage,
  StorageProvider,
  WEB_STORAGE_SERVICE_CONFIG,
  webStorageConfigDefault,
  WebStorageEventItem,
  WebStorageService
} from '../index';
import {LocalStorageProvider} from './providers/default';

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

      const addProviderResult = storage.addProvider('cookie', new (class CookieProvider implements StorageProvider {
        get(): WebStorage {
          return <WebStorage>{};
        }

        validate(): Observable<WebStorage> {
          return Observable.empty<WebStorage>();
        }
      })());
      const useProviderResult = storage.useProvider('cookie');

      expect(spies.onErrorFn).toHaveBeenCalledTimes(0);
      expect(addProviderResult).toBe(storage); // test chainability
      expect(useProviderResult).toBe(storage); // test chainability
    }))
  );
});

describe('WebStorage as promises', () => {
  let testKey = 'key';
  let testVal = 'val';

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      WebStorageService,
      {provide: WEB_STORAGE_SERVICE_CONFIG, useValue: webStorageConfigDefault}
    ]
  }));

  it(`Should be used in promise chain`,
    async(inject([WebStorageService], (storage: WebStorageService) => {
      Promise.resolve(testVal)
        // async set
        .then(storage.asPromise.set(testKey))
        .then(result => expect(result).toEqual(testVal))

        // async pull
        .then(storage.asPromise.pull(testKey))
        .then(result => expect(result).toEqual(testVal))

        // (chore)
        .then(() => testVal)
        .then(storage.asPromise.set(testKey))
        .then(result => expect(result).toEqual(testVal))

        // async get
        .then(storage.asPromise.get(testKey))
        .then(result => expect(result).toEqual(testVal))

        // async remove
        .then(storage.asPromise.remove(testKey)) // remove as promise
        .then(result => expect(result).toBe(testVal))

        // (chore)
        .then(() => testVal)
        .then(storage.asPromise.set(testKey))
        .then(result => expect(result).toEqual(testVal))

        // async keys
        .then(storage.asPromise.keys())
        .then(result => expect(result).toEqual([testKey]))

        // async getAll
        .then(storage.asPromise.getAll())
        .then(result => expect(result).toEqual({[testKey]: testVal}))

        // async removeAll
        .then(storage.asPromise.removeAll())
        .then($0 => expect(storage.length).toEqual(0));
    }))
  );
});

describe('WebStorage as observables', () => {
  let testKey = 'key';
  let testVal = 'val';

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      WebStorageService,
      {provide: WEB_STORAGE_SERVICE_CONFIG, useValue: webStorageConfigDefault}
    ]
  }));

  it(`Should be used with observable methods`,
    async(inject([WebStorageService], (storage: WebStorageService) => {
      // observable set
      Observable.fromPromise(storage.asPromise.set(testKey)(testVal))
        .map(result => expect(result).toEqual(testVal))
        .concat(
          // observable pull
          Observable.fromPromise(storage.asPromise.pull(testKey)())
            .map(result => expect(result).toBe(testVal))
        )
        .concat(
          // (chore)
          Observable.fromPromise(storage.asPromise.set(testKey)(testVal))
            .map(result => expect(result).toEqual(testVal))
        )
        .concat(
          // observable get
          Observable.fromPromise(storage.asPromise.get(testKey)())
            .map(result => expect(result).toEqual(testVal))
        )
        .concat(
          // observable remove
          Observable.fromPromise(storage.asPromise.remove(testKey)())
            .map(result => expect(result).toBe(testVal))
        )
        .concat(
          // (chore)
          Observable.fromPromise(storage.asPromise.set(testKey)(testVal))
            .map(result => expect(result).toEqual(testVal))
        )
        .concat(
          // observable keys
          Observable.fromPromise(storage.asPromise.keys()())
            .map(result => expect(result).toEqual([testKey]))
        )
        .concat(
          // observable getAll
          Observable.fromPromise(storage.asPromise.getAll()())
            .map(result => expect(result).toEqual({[testKey]: testVal}))
        )
        .concat(
          // observable removeAll
          Observable.fromPromise(storage.asPromise.removeAll()())
            .map($0 => expect(storage.length).toEqual(0))
        )
        .subscribe();
    }))
  );
});

describe('WebStorage interface', () => {
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

  it(`Should be configurable`,
    inject([WebStorageService], (storage: WebStorageService) => {
      // TODO update with concrete usage
      expect(typeof storage.setup).toBe('function');
    })
  );

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
      const setResult = storage.set(testKey, testVal);

      // set object
      storage.set(testObjKey, testObjVal);

      expect(storage.set).toHaveBeenCalled();
      expect(storage.get(testKey)).toBe(testVal);
      expect(storage.get(testObjKey)).toEqual(testObjVal);
      expect(setResult).toBe(storage); // test chainability

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

      const removeAllResult = storage.removeAll();

      expect(storage.removeAll).toHaveBeenCalled();
      expect(storage.length).toEqual(0);
      expect(removeAllResult).toBe(storage); // test chainability
      expect(storage.forEach(() => {})).toBe(storage); // test chainability
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
          onSetFn(val: WebStorageEventItem) {
            expect(val.key).toEqual(testKey);
            expect(val.newValue).toEqual(testVal);
            expect(val.oldValue).toBeNull();
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
          onGetFn(val: WebStorageEventItem) {
            expect(val.key).toEqual(testKey);
            expect(val.newValue).toEqual(testVal);
            expect(val.oldValue).toBeNull();
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
          subscribeFn(val: WebStorageEventItem) {
            expect(val.key).toEqual(testKey);
            expect(val.newValue).toBeNull();
            expect(val.oldValue).toEqual(testVal);
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
          onGetFn(val: WebStorageEventItem) {
            expect(val.key).toEqual(testKey);
            expect(val.newValue).toEqual(testVal);
            expect(val.oldValue).toBeNull();
          },
          onRemoveFn(val: WebStorageEventItem) {
            expect(val.key).toEqual(testKey);
            expect(val.newValue).toBeNull();
            expect(val.oldValue).toEqual(testVal);
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

  if ('BroadcastChannel' in window) {
    xit(`BroadcastChannel.postMessage`, () => {
      // TODO how?
    });
  }

  it(`(service) should remove all items`,
    inject([WebStorageService], (storage: WebStorageService) => {
      storage.removeAll();
    })
  );
});