function unique_name_358(req, res) {

    var _url  = url.parse(req.url);

    var dest  = _url.hostname;
    var port  = _url.port || 80;
    var host  = '127.0.0.1';

    var target;
    if(proxy_host === '<ANY>' || proxy_host === dest) {

      target = {
        host: host,
        port: port
      };
      req.url = _url.path;

    } else {
      target = {
        host: dest,
        port: port
      };
    }

    proxy.web(req, res, {target: target});

  }