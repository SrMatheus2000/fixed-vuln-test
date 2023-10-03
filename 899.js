function unique_name_505 (err, authorized, newData) {
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
  }