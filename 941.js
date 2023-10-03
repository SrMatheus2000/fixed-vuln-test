function unique_name_535 (err, connection) {
    if (err) {
      callback && callback(err);
      return;
    }
    if (self.settings.createDatabase) {
      // Call USE db ...
      connection.query('USE ' + client.escapeId(db), function (err) {
        if (err) {
          if (err && err.message.match(/(^|: )unknown database/i)) {
            var charset = self.settings.charset;
            var collation = self.settings.collation;
            var q = 'CREATE DATABASE ' + db + ' CHARACTER SET ' + charset + ' COLLATE ' + collation;
            connection.query(q, function (err) {
              if (!err) {
                connection.query('USE ' + client.escapeId(db), function (err) {
                  runQuery(connection);
                });
              } else {
                releaseConnectionAndCallback(connection, err);
              }
            });
            return;
          } else {
            releaseConnectionAndCallback(connection, err);
            return;
          }
        }
        runQuery(connection);
      });
    } else {
      // Bypass USE db
      runQuery(connection);
    }
  }