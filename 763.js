(v) => {
    const params = v.split(';');
    const token = params.shift().trim();

    if (extensions[token] === undefined) {
      extensions[token] = [];
    } else if (!extensions.hasOwnProperty(token)) {
      return;
    }

    const parsedParams = {};

    params.forEach((param) => {
      const parts = param.trim().split('=');
      const key = parts[0];
      var value = parts[1];

      if (value === undefined) {
        value = true;
      } else {
        // unquote value
        if (value[0] === '"') {
          value = value.slice(1);
        }
        if (value[value.length - 1] === '"') {
          value = value.slice(0, value.length - 1);
        }
      }

      if (parsedParams[key] === undefined) {
        parsedParams[key] = [value];
      } else if (parsedParams.hasOwnProperty(key)) {
        parsedParams[key].push(value);
      }
    });

    extensions[token].push(parsedParams);
  }