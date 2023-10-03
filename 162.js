function unique_name_85 (config) {
    var entries = [];

    var iter = function (value, prefix) {
      if (!prefix) prefix = [];

      if (Array.isArray(value)) {
        value.forEach(function (arrValue, idx) {
          iter(arrValue, prefix.concat(idx));
        });
      } else if (isPlainObject(value)) {
        var keys = Object.keys(value);
        if (keys.includes('__proto__') || keys.includes('constructor')) {
          return;
        }
        keys.forEach(function (key) {
          iter(value[key], prefix.concat(key));
        });
      } else {
        entries.push({ key: prefix, value: value });
      }
    };

    iter(config);
    return entries;
  }