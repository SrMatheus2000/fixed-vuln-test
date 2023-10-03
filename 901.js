function unique_name_506 (data, req, res) {
  var self = this
    , origin = req.headers.origin
    , headers = {
        'Content-Type': 'text/plain'
    };

  function writeErr (status, message) {
    if (data.query.jsonp && jsonpolling_re.test(data.query.jsonp)) {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end('io.j[' + data.query.jsonp + '](new Error("' + message + '"));');
    } else {
      res.writeHead(status, headers);
      res.end(message);
    }
  };

  function error (err) {
    writeErr(500, 'handshake error');
    self.log.warn('handshake error ' + err);
  };

  if (!this.verifyOrigin(req)) {
    writeErr(403, 'handshake bad origin');
    return;
  }

  var handshakeData = this.handshakeData(data);

  if (origin) {
    // https://developer.mozilla.org/En/HTTP_Access_Control
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  this.authorize(handshakeData, function (err, authorized, newData) {
    if (err) return error(err);

    if (authorized) {
      var id = self.generateId()
        , hs = [
              id
            , self.enabled('heartbeats') ? self.get('heartbeat timeout') || '' : ''
            , self.get('close timeout') || ''
            , self.transports(data).join(',')
          ].join(':');

      if (data.query.jsonp && jsonpolling_re.test(data.query.jsonp)) {
        hs = 'io.j[' + data.query.jsonp + '](' + JSON.stringify(hs) + ');';
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
      } else {
        res.writeHead(200, headers);
      }

      res.end(hs);

      self.onHandshake(id, newData || handshakeData);
      self.store.publish('handshake', id, newData || handshakeData);

      self.log.info('handshake authorized', id);
    } else {
      writeErr(403, 'handshake unauthorized');
      self.log.info('handshake unauthorized');
    }
  })
}