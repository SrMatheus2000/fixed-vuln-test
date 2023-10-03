function unique_name_530 (prop, val) {
  if (val === null || val === undefined) {
    // PostgreSQL complains with NULLs in not null columns
    // If we have an autoincrement value, return DEFAULT instead
    if (prop.autoIncrement) {
      return 'DEFAULT';
    }
    else {
      return 'NULL';
    }
  }
  if (val.constructor.name === 'Object') {
    if (prop.postgresql && prop.postgresql.dataType === 'json') {
       return JSON.stringify(val);
    }
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
    return this.toDatabase(prop, val);
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
    if (!val) {
      if (prop.autoIncrement) {
        return 'DEFAULT';
      }
      else {
        return 'NULL';
      }
    }
    if (!val.toISOString) {
      val = new Date(val);
    }
    var iso = escape(val.toISOString());
    return 'TIMESTAMP WITH TIME ZONE ' + iso;
    /*
     if (!val.toUTCString) {
     val = new Date(val);
     }
     return dateToPostgreSQL(val, prop.type.name === 'Date');
     */
  }

  // PostgreSQL support char(1) Y/N
  if (prop.type.name === 'Boolean') {
    if (val) {
      return "TRUE";
    } else {
      return "FALSE";
    }
  }

  if (prop.type.name === 'GeoPoint') {
    if (val) {
      return '(' + escape(val.lat) + ',' + escape(val.lng) + ')';
    } else {
      return 'NULL';
    }
  }

  return escape(val.toString());

}