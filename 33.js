function unique_name_12 (ch) {
    var ptr, keys, len;
    switch (ch.type) {
      case 'put':
        ptr = obj;
        keys = ch.key;
        len = keys.length;
        if (len) {
          keys.forEach(function (prop, i) {
            if (!(prop in ptr)) {
              ptr[prop] = {};
            }

            if (i < len - 1 && ptr.hasOwnProperty(prop)) {
              ptr = ptr[prop];
            } else if (prop !== '__proto__') {
              ptr[prop] = ch.value;
            }
          });
        } else {
          obj = ch.value;
        }
        break;

      case 'del':
        ptr = obj;
        keys = ch.key;
        len = keys.length;
        if (len) {
          keys.forEach(function (prop, i) {
            if (!(prop in ptr)) {
              ptr[prop] = {};
            }

            if (i < len - 1) {
              ptr = ptr[prop];
            } else {
              if (Array.isArray(ptr)) {
                ptr.splice(parseInt(prop, 10), 1);
              } else if (ptr.hasOwnProperty(prop)) {
                delete ptr[prop];
              }
            }
          });
        } else {
          obj = null;
        }
        break;
    }
  }