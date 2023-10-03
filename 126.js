function getStructure(target, prefix) {
  if (! isObject(target)) {
    return [{path: [], value: target}];
  }

  if (! prefix) {
    prefix = [];
  }

  if (Array.isArray(target)) {
    return target.reduce(function (result, value, i) {
      return result.concat(
        getPropStructure(value, prefix.concat(i)),
      );
    }, []);
  }
  else {
    return Object.getOwnPropertyNames(target)
    .reduce(function(result, key) {
      const value = target[key];

      return result.concat(
        getPropStructure(value, prefix.concat(key)),
      );
    }, []);
  }
}