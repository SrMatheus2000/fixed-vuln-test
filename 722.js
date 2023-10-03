function unique_name_397(func) {
    if (func.name) {
      return func.name;
    }

    var matches = func.toString().match(/^\s*function\s*(\w+)\s*\(/) ||
      func.toString().match(/^\s*\[object\s*(\w+)Constructor\]/);

    return matches ? matches[1] : '<anonymous>';
  }