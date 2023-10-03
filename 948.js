function unique_name_541 (prop, val, forCreate) {
  if (val === null || val === undefined) {
    return 'NULL';
  }
  if (!forCreate && val.constructor.name === 'Object') {
    var operator = Object.keys(val)[0]
    val = val[operator];
    if (operator === 'between') {
      return  this.toDatabase(prop, val[0]) +
        ' AND ' +
        this.toDatabase(prop, val[1]);
    } else if (operator === 'inq' || operator === 'nin') {
      if (Array.isArray(val)) { //if value is array
        for (var i = 0; i < val.length; i++) {
          val[i] = this.toDatabase(prop, val[i]);
        }
        return val.join(',');
      } else {
        return this.toDatabase(prop, val);
      }
    }
    return this.toDatabase(prop, val);
  }
  if (!prop) {
    return this.client.escape(val);
  }
  if (prop.type === Number) {
    return this.client.escape(val);
  }
  if (prop.type === Date) {
    if (!val) {
      return 'NULL';
    }
    if (!val.toUTCString) {
      val = new Date(val);
    }
    return '"' + dateToMysql(val) + '"';
  }
  if (prop.type === Boolean) {
    return val ? 1 : 0;
  }
  if (prop.type.name === 'GeoPoint') {
    return val ? 'Point(' + val.lat + ',' + val.lng + ')' : 'NULL';
  }
  if (prop.type === Object) {
    return this.client.escape(val);
  }
  if (typeof prop.type === 'function') {
    if (prop.type.modelName) {
      // For embedded models
      return this.client.escape(JSON.stringify(val));
    }
    return this.client.escape(prop.type(val));
  }
  return this.client.escape(val.toString());
}