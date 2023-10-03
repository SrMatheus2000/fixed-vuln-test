function writeErr (status, message) {
    if (data.query.jsonp && jsonpolling_re.test(data.query.jsonp)) {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end('io.j[' + data.query.jsonp + '](new Error("' + message + '"));');
    } else {
      res.writeHead(status, headers);
      res.end(message);
    }
  }