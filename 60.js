function unique_name_28(obj, name, loc) {
      if (!obj || !(name in obj)) {
        throw new Exception('"' + name + '" not defined in ' + obj, {
          loc: loc
        });
      }
      return container.lookupProperty(obj, name);
    }