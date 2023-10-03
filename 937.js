function unique_name_531 (prop, val, raw) {
  if (val === null || val === undefined) {
    // Oracle complains with NULLs in not null columns
    // If we have an autoincrement value, return DEFAULT instead
    if (prop.autoIncrement) {
      return 'DEFAULT';
    }
    else {
      return raw ? null : 'NULL';
    }
  }
  if (val.constructor.name === 'Object') {
    var operator = Object.keys(val)[0]
    val = val[operator];
    if (operator === 'between') {
      return this.toDatabase(prop, val[0]) + ' AND ' + this.toDatabase(prop, val[1]);
    }
    if (operator === 'inq' || operator === 'nin') {
      for (var i = 0; i < val.length; i++) {
        val[i] = escape(val[i]);
      }
      return val.join(',');
    }
    return this.toDatabase(prop, val, raw);
  }
  if (prop.type.name === 'Number') {
    if (!val && val !== 0) {
      if (prop.autoIncrement) {
        return 'DEFAULT';
      }
      else {
        return 'NULL';
      }
    }
    return escape(val);
  }

  if (prop.type.name === 'Date' || prop.type.name === 'Timestamp') {
    if (!val) {
      if (prop.autoIncrement) {
        return 'DEFAULT';
      }
      else {
        return 'NULL';
      }
    }
    if (!val.toUTCString) {
      val = new Date(val);
    }
    return dateToOracle(val, prop.type.name === 'Date');
  }

  // Oracle support char(1) Y/N
  if (prop.type.name === 'Boolean') {
    if (val) {
      return "'Y'";
    } else {
      return "'N'";
    }
  }

  return raw ? val : escape(val.toString());

}