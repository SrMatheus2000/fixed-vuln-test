function unique_name_544 (prop, val, wrap) {
  if (val === null || val === undefined) {
    // return 'NULL';
    return null;
  }
  if (prop.type && prop.type.modelName) {
    return escape(JSON.stringify(val));
  }
  if (val.constructor && val.constructor.name === 'Object') {
    var operator = Object.keys(val)[0]
    val = val[operator];
    if (operator === 'between') {
      //the between operator is never used for insert/updates
      // therefore always pass the wrap=true parameter when formatting the values
      return  this.toDatabase(prop, val[0], true) +
        ' AND ' +
        this.toDatabase(prop, val[1], true);
    } else if (operator === 'inq' || operator === 'nin') {
      //always wrap inq/nin values in single quotes when they are string types,
      // it's never used for insert/updates
      if (!(val.propertyIsEnumerable('length')) && typeof val === 'object'
        && typeof val.length === 'number') { //if value is array
        //check if it is an array of string, because in that cause we need to
        // wrap them in single quotes
        if (typeof val[0] === 'string') {
          return escape(val.join("','"));
        }
        return val.join(',');
      } else {
        if (typeof val === 'string') {
          val = escape(val);
        }
        return val;
      }
    } else if (operator === "max") {
      return val.field;
    }
  }
  if (!prop) {
    if (typeof val === 'string' && wrap) {
      val = escape(val);
    }
    return val;
  }
  if (prop.type.name === 'Number') {
    return escape(val);
  }
  if (prop.type.name === 'Date') {
    if (!val) {
      return null;
      // return 'NULL';
    }
    if (!val.toUTCString) {
      val = new Date(val);
    }
    val = dateToMsSql(val);
    if (wrap) {
      val = escape(val);
    }
    return val;
  }
  if (prop.type.name === "Boolean") {
    return val ? 1 : 0;
  }

  if (val === null || val === undefined) {
    return val;
  }

  if (wrap) {
    return escape(val.toString());
  }
  return val.toString();
}