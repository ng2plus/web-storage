# Ultimate web storage for Angular2

## Features:

* custom prefix
* built-in `localStorage` and `sessionStorage` providers
* `webStorage` Pipe
* custom providers
* switching providers on the fly
* notification options: `get`, `set`, `remove`, `removeAll`
* notifications broadcasting (1): `set`, `remove`, `removeAll`
* rich and chainable API: `set`, `get`, `pull`, `has`, `length`, `remove`, `removeAll`, `forEach`, `keys`, `getAll` and more
* currying style API for one line usage in `Promis`es
* `Observable`s support by wrapping `Promis`es into `Observable`s
* errors emitter
* well tested (all possible parts are covered)
* built on top of TypeScript and ES6, packed via webpack
* clean package after `npm install` without redundant trash

> (1) broadcasting is available via [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API). You have to make sure
that your target platform supports the API in order to use this feature. You also can include polyfill that adds `BroadcastChannel`
function to `window`. If `BroadcastChannel` is not supported by the platform and there is no polyfill fot that then notifications broadcasting will be disabled.

[Demo time!](http://embed.plnkr.co/2EaicczvXyV3mnqOZjVx/)

## Installation

`npm install @ng2plus/web-storage`

After installation UMD-style modules will be available too:

```
./node_modules/@ng2plus/web-storage/bundles/web-storage.umd.js
./node_modules/@ng2plus/web-storage/bundles/web-storage.umd.min.js
```

## Pre-requirements

You should manually shim `ES6` (`es2015`) features such as [`Promise`](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise), [`startsWith`](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith) and also `ES7` (`es2016`) feature [`includes`](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/includes).

## Setup

Include `WebStorageService` and its config in your root module.

```javascript
...
import {
  WebStorageService,
  WEB_STORAGE_DECLARATIONS,
  WEB_STORAGE_SERVICE_CONFIG,
  webStorageConfigDefault
} from '@ng2plus/web-storage';

@NgModule({
  ...
  declarations: [...WEB_STORAGE_DECLARATIONS],
  providers: [
    WebStorageService,
    {provide: WEB_STORAGE_SERVICE_CONFIG, useValue: webStorageConfigDefault}
  ]
})
export class AppModule {}
```

### Advanced Setup

You can change `WebStorage`'s setting by providing custom configuration object.

```javascript
import {
  WebStorageService,
  WEB_STORAGE_SERVICE_CONFIG
} from '@ng2plus/web-storage';

const webStorageConfig = {
  prefix: 'ng2plus'
};

@NgModule({
  ...
  providers   : [
    WebStorageService,
    {provide: WEB_STORAGE_SERVICE_CONFIG, useValue: webStorageConfig}
  ]
})
export class AppModule {}
```

It's not necessarily to provide all the options. For those which are missing will be set default values.

### Configuration object

Through the configuration object you can customize storage's behavior. Below you can find its structure and default values.

```javascript
{
  prefix: '__',
  provider: 'localStorage',
  notifyOn: {
    set: true,
    get: true,
    remove: true,
    removeAll: true
  }
}
```

*See [`WebStorageConfig`](src/web-storage.config.ts) interface for details*

*`WebStorageConfig` can be exported*

#### `prefix`

> prefix: string = '__'

Prefix that will be added to each key of stored value to avoid name collisions.

#### `provider`

> provider: string = 'localStorage'

Name of used storage provider. There are two embedded providers: `localStorage` and `sessionStorage`. But you can easily add a custom one (find more in API description).

#### `notifyOn`

>
```javascript
notifyOn: <NotifyOptions> = {
  set: true,
  get: true,
  remove: true,
  removeAll: true
}
```

* `set` - enable event emitter when item is added to storage
* `get` - enable event emitter when item is got from storage
* `remove` - enable event emitter when item is removed from storage
* `removeAll` - enable event emitter when `removeAll` method is called

*See [`NotifyOptions`](src/web-storage.config.ts) interface for details*

*`NotifyOptions` can be exported*

## Usage

Now you can use it inside your Angular2 application.

```javascript
import {WebStorageService} from '@ng2plus/web-storage';

@Component({
  template: '\u2764 {{'favorite_framework' | webStorage}}'
})
export class FavoriteFramework {
  constructor(private webStorage: WebStorageService) {
    webStorage.set('favorite_framework', 'Angular2!');
    console.log(webStorage.get('favorite_framework')); // Angular2!
  }
}
```

## API

### Methods

#### `set`

> set(key: string, item: any, replacer?: KeyValIterator\<any\>): WebStorageService

Put an `item` to the storage under a `key` name

* `key` - a name of key for the value

* `item` - any object to store

* `replacer` in case when the object is not serializable you can define replacer method, which is the same as the 3rd parameter of [`JSON.stringify()`](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)

Chainable. Returns `WebStorageService` itself.

---

#### `get`

Return an `item` from the storage by a `key` name.

> get\<T\>(key: string, defaultVal: any|KeyValIterator\<any\> = null): T

* `key` - a name of key to retrieve the value

* `defaultVal` you can set the default value to return in case when key is not found. Also you can provide a callback that is equivalent of the 3rd parameter of [`JSON.parse()`](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)

Returns stored value.

---

#### `pull`

Return and remove an `item` from the storage by a `key` name.

> pull\<T\>(key: string, defaultVal?: any | KeyValIterator\<any\>): T

* `key` - a name of key to retrieve the value

* `defaultVal` you can set the default value to return in case when key is not found. Also you can provide a callback that is equivalent of the 3rd parameter of [`JSON.parse()`](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)

Returns stored value and removes it from the storage.

*`StorageDictionary` interface can be exported*

---

#### `has`

Check if an item exists in the in storage under a `key` name.

> has(key: string): boolean

* `key` - a name of checked value

Returns true if value exists, elsewhere - false.

---

#### `keys`

Get all keys in storage (only keys for current prefix will be returned).

> keys(): string[]

Returns an array of keys.

*Storage provider should be iterable.*

---

#### `getAll`

Get all pairs `key => value` in storage (only pairs for current prefix will be returned).

> getAll(): StorageDictionary

Returns an array of objects representing values in the storage.

*`StorageDictionary` interface can be exported*

---

#### `forEach`

Iterates over the items in the storage (only pairs for current prefix will be iterated).

> forEach(fn: (item: any, key: string) => void, defaultVal?: any): WebStorageService

* `fn` - callback function that will be called with two arguments: current `item` and its `key` without prefix.

Chainable. Returns `WebStorageService` itself.

*Storage provider should be iterable.*

---

#### `remove`

Delete item from the storage.

> remove\<T\>(key: string): T

* `key` - a `key` name to delete

Returns removed item.

---

#### `removeAll`

Deletes all the items from the storage (only item for current prefix will be deleted).

> removeAll(): WebStorageService

Chainable. Returns `WebStorageService` itself.

---

#### `setup`

Updates current storage instance with the [configuration object](#configuration-object).

> setup(config: WebStorageConfig): WebStorageService

* `config` - see [configuration object](#configuration-object)

Chainable. Returns `WebStorageService` itself.

*`WebStorageConfig` interface can be exported*

---

#### `addProvider`

Add a custom storage provider. It should implement `StorageProvider` interface in order to work properly.

> addProvider(name: string, value: StorageProvider, useIt?: boolean): WebStorageService

* `name` - provider name. Can't be `localStorage` or `sessionStorage`
* `value` - instance of class that implements `StorageProvider` interface. Find [default providers](src/providers/default) for examples
* `useIt` - use added provider

Chainable. Returns `WebStorageService` itself.

*See [`StorageProvider`](src/providers/storage-provider.ts) interface for details*

*`StorageProvider` can be exported*

---

#### `useProvider`

Use specific storage provider.

> useProvider(providerName: string | DefaultWebStorageProvider): WebStorageService

* `providerName` - name of any added custom storage provider or one of defaults: `localStorage`, `sessionStorage`

Chainable. Returns `WebStorageService` itself.

### Properties

#### `length`

> length: number

Returns number of items in the storage (only items for current prefix are counted)

---

#### `asPromise`

Represents "promised" API that is easy to use chaining promises. All of methods are fallbacks to origins, e.g. `asPromise.set === set` but in some cases the arguments order is different.

>
```javascript
asPromise: {
  set: (key: string, replacer?: KeyValIterator<any>) => (item: any) => Promise<any>;
  get: <T>(key: string, defaultVal?: any) => () => Promise<T>;
  remove: <T>(key: string) => () => Promise<T>;
  removeAll: () => () => Promise<WebStorageService>;
  pull: <T>(key: string, defaultVal?: any) => () => Promise<T>;
  keys: () => () => Promise<string[]>;
  getAll: () => () => Promise<StorageDictionary>;
};
```

The main idea of usage in promise chains, compare #1 and #2:

```javascript
// #1
Promise.resolve('Octocat')
  .then(val => {
    webStorage.set('name', val);

    return val;
  })
  .then(val => console.log(webStorage.get('name') === val));

// #2
Promise.resolve('Octocat')
  .then(webStorage.asPromise.set('name')) // falls down previous value
  .then(val => console.log(webStorage.get('name') === val));
```

In the example above it's clear that the first case is too verbose and requires to write extra callback. `asPromise` interface tries to solve this by wrapping default methods into first class functions which return a promise.

Thus `webStorage.asPromise.set('name')` returns a function that returns a promise. We can re-write it into 3 steps to simplify understanding:

```javascript
// step 1
Promise.resolve('Octocat')
  .then(val => {
    const setAsPromise = webStorage.asPromise.set('name');

    return setAsPromise(val);
  })
  .then(val => console.log(webStorage.get('name') === val));

// step 2
Promise.resolve('Octocat')
  .then(val => webStorage.asPromise.set('name')(val))
  .then(val => console.log(webStorage.get('name') === val));

// step 3
Promise.resolve('Octocat')
  .then(webStorage.asPromise.set('name'))
  .then(val => console.log(webStorage.get('name') === val));
```

### Subscriptions

#### onError

Emits events when an internal error occurs or item can't be set or retrieve from storage.

> onError: ReplaySubject\<number\>

---

#### onSet

Emits event when item is put to storage. Triggers only when [`notifyOn.set`](#configuration-object) option is `true`.

> onSet: Subject\<WebStorageEventItem\>

*See [`WebStorageEventItem`](src/web-storage.config.ts) interface for details*

*`WebStorageEventItem` can be exported*

---

#### onGet

Emits event when item is put to storage. Triggers only when [`notifyOn.get`](#configuration-object) option is `true`.

> onGet: Subject\<WebStorageEventItem\>

*See [`WebStorageEventItem`](src/web-storage.config.ts) interface for details*

*`WebStorageEventItem` can be exported*

---

#### onRemove

Emits event when item is removed from storage. Triggers only when [`notifyOn.onRemove`](#configuration-object) option is `true`.

> onRemove: Subject\<WebStorageEventItem\>

*See [`WebStorageEventItem`](src/web-storage.config.ts) interface for details*

*`WebStorageEventItem` can be exported*

---

#### onRemoveAll

Emits event when `removeAll` method is called. Triggers only when [`notifyOn.onRemoveAll`](#configuration-object) option is `true`.

> onRemoveAll: Subject\<number\>

Emits number of removed items.

---

#### onMessage

Works similar to [`StorageEvent`](https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent). When one of events (`set`, `get` or `removeAll`) is happen (depends on [`notifyOn`](#configuration-object) configuration) the message is broadcasted to browsing contexts within the same origin.

> onMessage: Subject\<WebStorageEvent\>

*This feature requires [`BroadcastChannel` API support](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API) or at least a polyfill*

*See [`WebStorageEvent`](src/web-storage.config.ts) interface for details*

*`WebStorageEvent` can be exported*

## Advanced Usage

### Observables

Thanks to the `asPromise` interface you can mix call to storage methods with observables:

```javascript
Observable.fromPromise(webStorage.asPromise.set('name')('Octocat'))
  .map(result => console.log(webStorage.get('name') === result));
```

### Custom Providers

With help on [`addProvider`](#addprovider) method you can add custom storage implementation. Let's implement simple in memory key-value storage.

First of all a provider should implement [`StorageProvider`](src/providers/storage-provider.ts) interface which requires to implement two methods: `get` and `validate`. `get` method is used to retrieve an instance of provider and `validate` method is used to check if the provider is available in current context (it calls only once, each time when `useProvider` is called or the 3rd parameter of `addProvider` method is `true`).

Method `get` has to return an instance of class which implements [`WebStorage`](src/web-storage.ts) interface.

```javascript
import {WebStorage} from '@ng2plus/web-storage';

// util decorator
function hidden(target, key) {
  Object.defineProperty(target, key, {
    enumerable: false,
    writable: true,
    value: {}
  });
}

// define custom storage which implements `WebStorage` interface
class CustomStorage implements WebStorage {
  @hidden reserved = {};

  get length(): number {
    let count = -1;

    for (let i in Object.getOwnPropertyNames(this)) ++count;

    return count;
  }

  clear(): void {
    for (let i in this) this.removeItem(i);
  }

  getItem(key: string): any {
    return (this.isReserved(key) ? this.reserved[key] : this[key]) || null
  }

  key(index: number): string {
    let d = 0;
    let found = '';

    for (let i in Object.getOwnPropertyNames(this)) {
      if (d === index) {
        found = this[i];
        break;
      }

      ++d;
    }

    return found || null;
  }

  removeItem(key: string): void {
    delete (this.isReserved(key) ? this.reserved : this)[key];
  }

  setItem(key: string, data: string): void {
    if (this.isReserved(key)) {
      this.reserved[key] = data;
    } else {
      this[key] = data;
    }
  }

  private isReserved(key) {
    return ['reserved', 'length', 'key'].includes(key);
  }

  [index: number]: string;
}

// implement provider for `CustomStorage`
class CustomStorageProvider implements StorageProvider {
  private storage: CustomStorage = new CustomStorage();

  get(): WebStorage {
    return this.storage;
  }

  validate(): Observable<WebStorage> {
    return new Observable<WebStorage>(observer => {
      if (1 > 2) { // you can specify any kind of check you want
        observer.error(`CustomStorage provider is not available`);
      }

      observer.next(this.get());
      observer.complete();
    });
  }

  // if you don't need any kind of validation, just return provider
  /*
  validate(): Observable<WebStorage> {
    return Observable.of(this.get());
  }
  */
}

// finally, register and use new provider
storage.addProvider('customProvider', new CustomStorageProvider(), true);
```
