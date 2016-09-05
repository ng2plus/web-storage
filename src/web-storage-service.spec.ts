import { ReflectiveInjector } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import {WebStorageService} from './web-storage.service';
import {WebStorageValidator} from './web-storage.validator';
import {WEB_STORAGE_SERVICE_CONFIG, webStorageConfigDefault} from './web-storage.config';

describe('WebStorage Service', () => {
  let storage: WebStorageService,
    testKey = 'key',
    testVal = 'val';

  beforeEach(() => {
    let injector = ReflectiveInjector.resolveAndCreate([
      WebStorageService,
      WebStorageValidator,
      {provide: WEB_STORAGE_SERVICE_CONFIG, useValue: webStorageConfigDefault}
    ]);

    storage = injector.get(WebStorageService);
  });

  it(`should be 'null' when trying to get the key that doesn't exists`, () => {
    expect(storage.get(testKey)).toBeNull();
  });

  it(`should set value`, () => {
    expect(() => storage.set(testKey, testVal)).not.toThrow();
  });

  it(`should get the value`, () => {
    expect(storage.get(testKey)).toEqual(testVal);
  });

  it(`should remove the value`, () => {
    expect(storage.remove(testKey)).toEqual(testVal); // TODO fails
  });

  it(`should be empty`, () => {
    expect(storage.length).toEqual(0);
  });
});
