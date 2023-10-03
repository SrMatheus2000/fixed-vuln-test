function unique_name_540 (sql, callback) {
  var self = this;
  if (!this.dataSource.connected) {
    return this.dataSource.once('connected', function () {
      this.query(sql, callback);
    }.bind(this));
  }
  var client = this.client;
  var time = Date.now();
  var debugEnabled = debug.enabled;
  var db = this.settings.database;
  var log = this.log;
  if (typeof callback !== 'function') throw new Error('callback should be a function');
  if (debugEnabled) {
    debug('SQL: %s', sql);
  }

  function releaseConnectionAndCallback(connection, err, result) {
    connection.release();
    callback && callback(err, result);
  }

  function runQuery(connection) {
    connection.query(sql, function (err, data) {
      if (debugEnabled) {
        if (err) {
          console.error('Error: %j', err);
        }
        debug('Data: ', data);
      }
      if (log) {
        log(sql, time);
      }
      releaseConnectionAndCallback(connection, err, data);
    });
  }

  client.getConnection(function (err, connection) {
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
  });
}