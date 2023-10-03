function unique_name_452 ($el) {
  var options = $el.data();

  _.each(options, function(value, key) {
    if (_.isString(value)) {
      try {
        value = JSON.parse(value);
      } catch (err) {}
      options[key] = value;
    }
  });

  return options;
}