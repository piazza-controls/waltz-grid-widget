import _ from "lodash";

export function mergeComp(objValue: unknown, srcValue: unknown) {
  if (_.isArray(srcValue) && _.isArray(objValue)) {

    const mergedDiff: any = srcValue.map(val => {
      const match = objValue.find((srcVal: any) => _.isEqual(srcVal.name, val.name));
      if (match) {
        return _.mergeWith(match, val, mergeComp);
      }
      else {
        return val;
      }
    });
    return _.unionBy(objValue, mergedDiff, "name");
  }
}

export function eqComp(objValue: unknown, srcValue: unknown): boolean | undefined {
  const isIndexedObj = (val: any) => _.isObject(val) && _.has(val, "name")
  if (_.isArray(srcValue) && _.isArray(objValue)) {
    if (!(srcValue.every(isIndexedObj) && objValue.every(isIndexedObj))) {
      return undefined
    }
    if (srcValue.length !== objValue.length) {
      return false
    }
    return srcValue.every(val => {
      const match = objValue.find((srcVal: any) => _.isEqual(srcVal.name, val.name));
      if (match) {
        return _.isEqualWith(match, val, eqComp);
      } else {
        return false
      }
    });
  }
}