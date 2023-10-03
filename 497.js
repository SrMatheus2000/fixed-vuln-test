function unique_name_267(obj, field) {
    if (!obj) {
      return obj;
    }
    if (field === 'constructor' && !obj.propertyIsEnumerable(field)) {
      return undefined;
    }
    return obj[field];
  }