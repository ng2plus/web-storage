/**
 *
 * @param {Object} $1 target
 * @param {string | symbol} $2 propertyKey
 * @param descriptor
 * @returns {MethodDecorator}
 */
export function addPrefixToKey<TFunction extends Function>($1, $2, descriptor: TypedPropertyDescriptor<TFunction>) {
  return {
    value(key: string, ...args: any[]) {
      return descriptor.value.call(this, this.prefixKey(key), ...args);
    }
  }
}
