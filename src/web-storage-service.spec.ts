import { ReflectiveInjector } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import {WebStorageService} from './web-storage.service';

describe('WebStorage Service', () => {
  let storage: WebStorageService;

  beforeEach(() => {
    let injector = ReflectiveInjector.resolveAndCreate([
      WebStorageService,
    ]);

    storage = injector.get(WebStorageService);
  });

  it(`should be empty when key doesn't exists`, () => {
    expect(storage.get('key')).toBeNull();
  });

  it(`should set value`, () => {
    expect(() => storage.set('key', 'val')).not.toThrow();
  });

  it(`should get the value`, () => {
      expect(storage.get('key')).toEqual('val');
    });
});