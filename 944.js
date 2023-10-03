function unique_name_538 (propName) {
    var i = m.properties[propName].index;
    if (!i) {
      return;
    }
    var found = ai[propName] && ai[propName].info;
    if (!found) {
      var pName = self.client.escapeId(propName);
      var type = '';
      var kind = '';
      if (i.type) {
        type = 'USING ' + i.type;
      }
      if (i.kind) {
        // kind = i.kind;
      }
      if (kind && type) {
        sql.push('ADD ' + kind + ' INDEX ' + pName + ' (' + pName + ') ' + type);
      } else {
        (typeof i === 'object' && i.unique && i.unique === true) && (kind = "UNIQUE");
        sql.push('ADD ' + kind + ' INDEX ' + pName + ' ' + type + ' (' + pName + ') ');
      }
    }
  }