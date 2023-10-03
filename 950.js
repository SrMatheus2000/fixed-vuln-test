function unique_name_543 (model, actualFields, actualIndexes, done, checkOnly) {
  var self = this;
  var m = this._models[model];
  var propNames = Object.keys(m.properties).filter(function (name) {
    return !!m.properties[name];
  });
  var indexNames = m.settings.indexes ? Object.keys(m.settings.indexes).filter(function (name) {
    return !!m.settings.indexes[name];
  }) : [];
  var sql = [];
  var ai = {};

  if (actualIndexes) {
    actualIndexes.forEach(function (i) {
      var name = i.Key_name;
      if (!ai[name]) {
        ai[name] = {
          info: i,
          columns: []
        };
      }
      ai[name].columns[i.Seq_in_index - 1] = i.Column_name;
    });
  }
  var aiNames = Object.keys(ai);

  // change/add new fields
  propNames.forEach(function (propName) {
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
  });

  // drop columns
  if (actualFields) {
    actualFields.forEach(function (f) {
      var notFound = !~propNames.indexOf(f.Field);
      if (m.properties[f.Field] && self.id(model, f.Field)) return;
      if (notFound || !m.properties[f.Field]) {
        sql.push('DROP COLUMN ' + self.client.escapeId(f.Field));
      }
    });
  }

  // remove indexes
  aiNames.forEach(function (indexName) {
    if (indexName === 'PRIMARY' || (m.properties[indexName] && self.id(model, indexName))) return;
    if (indexNames.indexOf(indexName) === -1 && !m.properties[indexName] || m.properties[indexName] && !m.properties[indexName].index) {
      sql.push('DROP INDEX ' + self.client.escapeId(indexName));
    } else {
      // first: check single (only type and kind)
      if (m.properties[indexName] && !m.properties[indexName].index) {
        // TODO
        return;
      }
      // second: check multiple indexes
      var orderMatched = true;
      if (indexNames.indexOf(indexName) !== -1) {
        m.settings.indexes[indexName].columns.split(/,\s*/).forEach(function (columnName, i) {
          if (ai[indexName].columns[i] !== columnName) orderMatched = false;
        });
      }
      if (!orderMatched) {
        sql.push('DROP INDEX ' + self.client.escapeId(indexName));
        delete ai[indexName];
      }
    }
  });

  // add single-column indexes
  propNames.forEach(function (propName) {
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
  });

  // add multi-column indexes
  indexNames.forEach(function (indexName) {
    var i = m.settings.indexes[indexName];
    var found = ai[indexName] && ai[indexName].info;
    if (!found) {
      var iName = self.client.escapeId(indexName);
      var type = '';
      var kind = '';
      if (i.type) {
        type = 'USING ' + i.type;
      }
      if (i.kind) {
        kind = i.kind;
      }
      if (kind && type) {
        sql.push('ADD ' + kind + ' INDEX ' + iName + ' (' + i.columns + ') ' + type);
      } else {
        sql.push('ADD ' + kind + ' INDEX ' + type + ' ' + iName + ' (' + i.columns + ')');
      }
    }
  });

  if (sql.length) {
    var query = 'ALTER TABLE ' + self.tableEscaped(model) + ' ' + sql.join(',\n');
    if (checkOnly) {
      done(null, true, {statements: sql, query: query});
    } else {
      this.query(query, done);
    }
  } else {
    done();
  }

  function actualize(propName, oldSettings) {
    var newSettings = m.properties[propName];
    if (newSettings && changed(newSettings, oldSettings)) {
      var pName = self.client.escapeId(propName);
      sql.push('CHANGE COLUMN ' + pName + ' ' + pName + ' ' +
        self.propertySettingsSQL(model, propName));
    }
  }

  function changed(newSettings, oldSettings) {
    if (oldSettings.Null === 'YES') { // Used to allow null and does not now.
      if (newSettings.allowNull === false) return true;
      if (newSettings.null === false) return true;
      if (newSettings.nullable === false) return true;
      if (newSettings.required || newSettings.id) return true;
    }
    if (oldSettings.Null === 'NO') { // Did not allow null and now does.
      if (newSettings.allowNull === true) return true;
      if (newSettings.null === true) return true;
      if (newSettings.nullable === true) return true;
      if (newSettings.null === undefined &&
        newSettings.allowNull === undefined &&
        !newSettings.required &&
        !newSettings.id) return true;
    }

    if (oldSettings.Type.toUpperCase() !== datatype(newSettings).toUpperCase())
      return true;
    return false;
  }
}