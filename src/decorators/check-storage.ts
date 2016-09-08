import {WS_ERROR} from '../web-storage.messages';

/**
 * Checks if storage provider is set before calling a method or accessing a property.
 * If provider isn't set then the error will be emitted to `onError` observable and default value will be returned
 *
 * @param defaultValue
 * @returns {PropertyDecorator|MethodDecorator}
 */
export function checkStorage(defaultValue: any = null) {
  return function <TFunction extends Function>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<TFunction>): any {
    // check if decorator applies to an accessor
    if (!descriptor.value && descriptor.get) {
      describeAccessor<TFunction>({target, propertyKey, descriptor}, defaultValue);
    } else {
      return describeMethod<TFunction>({target, propertyKey, descriptor}, defaultValue);
    }
  }
}

/**
 * Hooks method and emits error to `onError` observable if provider isn't set
 * @param dps
 * @param defaultValue
 * @returns {TypedPropertyDescriptor}
 */
function describeMethod<T extends Function>(dps: DecoratorParameters<T>, defaultValue: any = null): Object {
  return {
    value(...args: any[]) { /** @see {WebStorageService} for `this` reference */
      if (this.storage === null) {
        this.emitError(WS_ERROR.PROVIDER_NOT_SET);

        return defaultValue;
      }

      return dps.descriptor.value.apply(this, args);
    }
  };
}

/**
 * Hooks accessor and emits error to `onError` observable if provider isn't set
 * @param target       \
 * @param propertyKey  |=> object parameter
 * @param descriptor  /
 * @param defaultValue
 * @returns {TypedPropertyDescriptor}
 */
function describeAccessor<T>({target, propertyKey, descriptor}: DecoratorParameters<T>, defaultValue: any = null): Object {
  return Object.defineProperty(target, propertyKey, {
    get() { /** @see {WebStorageService} for `this` reference */
      if (this.storage === null) {
        this.emitError(WS_ERROR.PROVIDER_NOT_SET);

        return defaultValue;
      }

      // fallback to original call
      return descriptor.get();
    },
    set: descriptor.set,
    configurable: descriptor.configurable,
    enumerable: descriptor.enumerable
  });
}

export interface DecoratorParameters<T> {
  target: Object;
  propertyKey: string | symbol;
  descriptor: TypedPropertyDescriptor<T>;
}
