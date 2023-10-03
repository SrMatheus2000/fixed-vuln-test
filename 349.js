function unique_name_180(instance) {
  instance.registerHelper('lookup', function(obj, field) {
    if (!obj) {
      return obj;
    }
    if (dangerousPropertyRegex.test(String(field)) && !obj.propertyIsEnumerable(field)) {
      return undefined;
    }
    return obj[field];
  });
}