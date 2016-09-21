## Ultimate web storage for Angular2

### Features:

* custom prefix
* built-in `localStorage` and `sessionStorage` providers
* custom providers
* switching providers on the fly
* notification options: `get`, `set`, `remove`, `removeAll`
* notifications broadcasting (1): `set`, `remove`, `removeAll`
* rich and chainable API: `set`, `get`, `pull`, `has`, `length`, `remove`, `removeAll`, `forEach`, `keys`, `getAll` and more
* "promised" interface with currying style API for one line usage in promises
* errors emitter
* well tested (all possible parts are covered)
* built on top of TypeScript and ES6, packed via webpack
* clean package after installing without redundant trash

> (1) broadcasting is available via [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API). You have to make sure
that your target platform supports the API in order to use this feature. You also can include polyfill that adds `BroadcastChannel`
function to `window`. If `BroadcastChannel` is not supported by the platform and there is no polyfill fot that then notifications broadcasting will be disabled.

### Installation

`npm install @ng2plus/web-storage`