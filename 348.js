function unique_name_179(obj, field) {
    if (!obj) {
      return obj;
    }
    if (dangerousPropertyRegex.test(String(field)) && !obj.propertyIsEnumerable(field)) {
      return undefined;
    }
    return obj[field];
  }