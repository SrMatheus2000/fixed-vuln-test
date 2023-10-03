function unique_name_575(req, next) {
    var buffer = new Buffer(parseInt(req.header('Content-length')), 'binary').fill(0);
    var offset = 0;
    req.on('data', function(chunk) {
      chunk.copy(buffer, offset);
      offset += chunk.length });
    req.on('end', function() {
      next(buffer); });
  }