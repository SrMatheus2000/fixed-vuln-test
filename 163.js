function unique_name_86 (configObj, envObj) {
    var context = {
      config: Object.assign(Object.create(null), configObj),
      env: envObj || process.env,
    };

    var entries = ConnieLang.getEntries(context.config);

    // iterate until no updates have been made
    var digest = function () {
      var updated = false;

      entries.forEach(function (e) {
        var interpreter = ConnieLang.firstInnermostInterpreterFromValue(e.value, context);
        if (!interpreter) return;

        var newValue = interpreter.replaceInValue(e.value, context);
        if (newValue !== e.value) {
          e.value = newValue;
          updated = true;
        }
      });

      return updated;
    };

    while (digest());

    var result = {};
    entries.forEach(function (e) {
      setValue(result, e.key, e.value);
    });

    return result;
  }