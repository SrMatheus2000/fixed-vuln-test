function unique_name_536 (propName) {
    if (m.properties[propName] && self.id(model, propName)) return;
    var found;
    if (actualFields) {
      actualFields.forEach(function (f) {
        if (f.Field === propName) {
          found = f;
        }
      });
    }

    if (found) {
      actualize(propName, found);
    } else {
      sql.push('ADD COLUMN ' + self.client.escapeId(propName) + ' ' +
        self.propertySettingsSQL(model, propName));
    }
  }