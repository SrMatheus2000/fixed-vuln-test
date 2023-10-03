function unique_name_123(request, response, params) {
    if (!params.message)
      return this._returnError(response, {message: 'Received request with no message: ' + this._formatRequest(request)});

    try {
      this.debug('Received message via HTTP ' + request.method + ': ?', params.message);

      var message = JSON.parse(params.message),
          jsonp   = params.jsonp || Faye.JSONP_CALLBACK,
          isGet   = (request.method === 'GET'),
          type    = isGet ? this.TYPE_SCRIPT : this.TYPE_JSON,
          headers = Faye.extend({}, type),
          origin  = request.headers.origin;

      if (!this.VALID_JSONP_CALLBACK.test(jsonp))
        return this._returnError(response, {message: 'Invalid JSON-P callback: ' + jsonp});

      if (origin) headers['Access-Control-Allow-Origin'] = origin;
      headers['Cache-Control'] = 'no-cache, no-store';
      headers['X-Content-Type-Options'] = 'nosniff';

      this._server.process(message, request, function(replies) {
        var body = Faye.toJSON(replies);

        if (isGet) {
          body = '/**/' + jsonp + '(' + this._jsonpEscape(body) + ');';
          headers['Content-Disposition'] = 'attachment; filename=f.txt';
        }

        headers['Content-Length'] = new Buffer(body, 'utf8').length.toString();
        headers['Connection'] = 'close';

        this.debug('HTTP response: ?', body);
        response.writeHead(200, headers);
        response.end(body);
      }, this);
    } catch (error) {
      this._returnError(response, error);
    }
  }