function unique_name_534 (f) {
      var notFound = !~propNames.indexOf(f.Field);
      if (m.properties[f.Field] && self.id(model, f.Field)) return;
      if (notFound || !m.properties[f.Field]) {
        sql.push('DROP COLUMN ' + self.client.escapeId(f.Field));
      }
    }