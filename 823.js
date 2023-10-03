function unique_name_451(value, key) {
    if (_.isString(value)) {
      try {
        value = JSON.parse(value);
      } catch (err) {}
      options[key] = value;
    }
  }