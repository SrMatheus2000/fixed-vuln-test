function unique_name_539 (indexName) {
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
  }