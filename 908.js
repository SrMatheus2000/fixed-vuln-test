function limit(bytes){
  if ('string' == typeof bytes) bytes = parse(bytes);
  if ('number' != typeof bytes) throw new Error('limit() bytes required');
  return function limit(req, res, next){
    var received = 0
      , len = req.headers['content-length']
        ? parseInt(req.headers['content-length'], 10)
        : null;

    // self-awareness
    if (req._limit) return next();
    req._limit = true;

    // limit by content-length
    if (len && len > bytes) return next(utils.error(413));

    // limit
    req.on('data', function(chunk){
      received += chunk.length;
      if (received > bytes) req.destroy();
    });

    next();
  };
}