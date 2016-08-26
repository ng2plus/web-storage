export const utils = {
  defaults: <T, U extends T>(defaults: T, obj: U) => {
    for (let val in defaults) {
      if (defaults.hasOwnProperty(val) && obj.hasOwnProperty(val) && obj[val] !== null) {
        defaults[val] = obj[val];
      }
    }
  }
};
