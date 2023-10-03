function actualize(propName, oldSettings) {
    var newSettings = m.properties[propName];
    if (newSettings && changed(newSettings, oldSettings)) {
      var pName = self.client.escapeId(propName);
      sql.push('CHANGE COLUMN ' + pName + ' ' + pName + ' ' +
        self.propertySettingsSQL(model, propName));
    }
  }