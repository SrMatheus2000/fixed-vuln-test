function unique_name_537 (indexName) {
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
  }