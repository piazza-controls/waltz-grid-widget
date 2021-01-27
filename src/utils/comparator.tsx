import _ from "lodash";

export function comparator(objValue: unknown, srcValue: unknown) {
  if (_.isArray(srcValue) && _.isArray(objValue)) {

    const mergedDiff: any = srcValue.map(val => {
      const match = objValue.find((srcVal: any) => _.isEqual(srcVal.name, val.name));
      if (match) {
        return _.mergeWith(match, val, comparator);
      }
      else {
        return val;
      }
    });
    return _.unionBy(objValue, mergedDiff, "name");
  }
}
