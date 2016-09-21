export const utils = {
  /**
   * (Immutable) Merges `defaults` object with the same keys in `obj` object
   * @param {T} defaults
   * @param {U} obj
   * @returns {T} new reference-free merged object
   */
  merge<T, U extends T>(defaults: T, obj: U): T {
    let merged: T = Object.assign({}, defaults);

    for (let val in merged) {
      if (merged.hasOwnProperty(val) && obj.hasOwnProperty(val) && obj[val] !== null) {
        merged[val] = obj[val];
      }
    }

    return merged;
  },
  /**
   * Makes a dictionary of "key:value" pairs without prototype
   * @param obj
   * @returns {T&U}
   */
  dictionary<T extends Object>(...obj: T[]): T {
    return Object.assign(Object.create(null), ...obj);
  },
  /**
   * Capitalizes first letter
   * @param string
   * @returns {string}
   */
  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  },
  promisifyFn(fn: (...args: any[]) => any, args: any[], context: any): Promise<any> {
    try {
      const result = fn.apply(context ? context : null, args);

      return Promise.resolve(result);
    } catch(e) {
      return Promise.reject(e.message);
    }
  }
};

export interface KeyValIterator<T> {
  (key: string, value: T): any
}