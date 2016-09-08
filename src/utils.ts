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
  noop() {}
};
