function unique_name_280(options) {
  var baseDir = options.files;
  var contentTypesByExtension = {
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.css': 'text/css',
    '.xml': 'application/xml',
    '.json': 'application/json',
    '.js': 'application/javascript',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
  };

  //Setup all of the services
  var services = options.services;
  for (var uri in services) {
    var svcObj = services[uri];

    //Setup the processor
    if (svcObj.processor instanceof MultiplexedProcessor) {
      //Multiplex processors have pre embedded processor/handler pairs, save as is
      svcObj.processor = svcObj.processor;
    } else {
      //For historical reasons Node.js supports processors passed in directly or via the
      //  IDL Compiler generated class housing the processor. Also, the options property
      //  for a Processor has been called both cls and processor at different times. We
      //  support any of the four possibilities here.
      var processor = (svcObj.processor) ? (svcObj.processor.Processor || svcObj.processor) :
                                           (svcObj.cls.Processor || svcObj.cls);
      //Processors can be supplied as constructed objects with handlers already embedded,
      //  if a handler is provided we construct a new processor, if not we use the processor
      //  object directly
      if (svcObj.handler) {
        svcObj.processor = new processor(svcObj.handler);
      } else {
        svcObj.processor = processor;
      }
    }
    svcObj.transport = svcObj.transport ? svcObj.transport : TBufferedTransport;
    svcObj.protocol = svcObj.protocol ? svcObj.protocol : TBinaryProtocol;
  }

  //Verify CORS requirements
  function VerifyCORSAndSetHeaders(request, response) {
    if (request.headers.origin && options.cors) {
      if (options.cors["*"] || options.cors[request.headers.origin]) {
        //Allow, origin allowed
        response.setHeader("access-control-allow-origin", request.headers.origin);
        response.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
        response.setHeader("access-control-allow-headers", "content-type, accept");
        response.setHeader("access-control-max-age", "60");
        return true;
      } else {
        //Disallow, origin denied
        return false;
      }
    }
    //Allow, CORS is not in use
    return true;
  }


  //Handle OPTIONS method (CORS)
  ///////////////////////////////////////////////////
  function processOptions(request, response) {
    if (VerifyCORSAndSetHeaders(request, response)) {
      response.writeHead("204", "No Content", {"content-length": 0});
    } else {
      response.writeHead("403", "Origin " + request.headers.origin + " not allowed", {});
    }
    response.end();
  }


  //Handle POST methods (TXHRTransport)
  ///////////////////////////////////////////////////
  function processPost(request, response) {
    //Lookup service
    var uri = url.parse(request.url).pathname;
    var svc = services[uri];
    if (!svc) {
      response.writeHead("403", "No Apache Thrift Service at " + uri, {});
      response.end();
      return;
    }

    //Verify CORS requirements
    if (!VerifyCORSAndSetHeaders(request, response)) {
      response.writeHead("403", "Origin " + request.headers.origin + " not allowed", {});
      response.end();
      return;
    }

    //Process XHR payload
    request.on('data', svc.transport.receiver(function(transportWithData) {
      var input = new svc.protocol(transportWithData);
      var output = new svc.protocol(new svc.transport(undefined, function(buf) {
        try {
          response.writeHead(200);
          response.end(buf);
        } catch (err) {
          response.writeHead(500);
          response.end();
        }
      }));

      try {
        svc.processor.process(input, output);
        transportWithData.commitPosition();
      } catch (err) {
        if (err instanceof InputBufferUnderrunError) {
          transportWithData.rollbackPosition();
        } else {
          response.writeHead(500);
          response.end();
        }
      }
    }));
  }


  //Handle GET methods (Static Page Server)
  ///////////////////////////////////////////////////
  function processGet(request, response) {
    //Undefined or empty base directory means do not serve static files
    if (!baseDir || "" === baseDir) {
      response.writeHead(404);
      response.end();
      return;
    }

    //Verify CORS requirements
    if (!VerifyCORSAndSetHeaders(request, response)) {
      response.writeHead("403", "Origin " + request.headers.origin + " not allowed", {});
      response.end();
      return;
    }

    //Locate the file requested and send it
    var uri = url.parse(request.url).pathname;
    var filename = path.resolve(path.join(baseDir, uri));

    //Ensure the basedir path is not able to be escaped
    if (filename.indexOf(baseDir) != 0) {
      response.writeHead(400, "Invalid request path", {});
      response.end();
      return;
    }

    fs.exists(filename, function(exists) {
      if(!exists) {
        response.writeHead(404);
        response.end();
        return;
      }

      if (fs.statSync(filename).isDirectory()) {
        filename += '/index.html';
      }

      fs.readFile(filename, "binary", function(err, file) {
        if (err) {
          response.writeHead(500);
          response.end(err + "\n");
          return;
        }
        var headers = {};
        var contentType = contentTypesByExtension[path.extname(filename)];
        if (contentType) {
          headers["Content-Type"] = contentType;
        }
        for (var k in options.headers) {
          headers[k] = options.headers[k];
        }
        response.writeHead(200, headers);
        response.write(file, "binary");
        response.end();
      });
    });
  }


  //Handle WebSocket calls (TWebSocketTransport)
  ///////////////////////////////////////////////////
  function processWS(data, socket, svc, binEncoding) {
    svc.transport.receiver(function(transportWithData) {
      var input = new svc.protocol(transportWithData);
      var output = new svc.protocol(new svc.transport(undefined, function(buf) {
        try {
          var frame = wsFrame.encode(buf, null, binEncoding);
          socket.write(frame);
        } catch (err) {
          //TODO: Add better error processing
        }
      }));

      try {
        svc.processor.process(input, output);
        transportWithData.commitPosition();
      }
      catch (err) {
        if (err instanceof InputBufferUnderrunError) {
          transportWithData.rollbackPosition();
        }
        else {
          //TODO: Add better error processing
        }
      }
    })(data);
  }

  //Create the server (HTTP or HTTPS)
  var server = null;
  if (options.tls) {
    server = https.createServer(options.tls);
  } else {
    server = http.createServer();
  }

  //Wire up listeners for upgrade(to WebSocket) & request methods for:
  //   - GET static files,
  //   - POST XHR Thrift services
  //   - OPTIONS CORS requests
  server.on('request', function(request, response) {
    if (request.method === 'POST') {
      processPost(request, response);
    } else if (request.method === 'GET') {
      processGet(request, response);
    } else if (request.method === 'OPTIONS') {
      processOptions(request, response);
    } else {
      response.writeHead(500);
      response.end();
    }
  }).on('upgrade', function(request, socket, head) {
    //Lookup service
    var svc;
    try {
      svc = services[Object.keys(services)[0]];
    } catch(e) {
      socket.write("HTTP/1.1 403 No Apache Thrift Service available\r\n\r\n");
      return;
    }
    //Perform upgrade
    var hash = crypto.createHash("sha1");
    hash.update(request.headers['sec-websocket-key'] + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
    socket.write("HTTP/1.1 101 Switching Protocols\r\n" +
                   "Upgrade: websocket\r\n" +
                   "Connection: Upgrade\r\n" +
                   "Sec-WebSocket-Accept: " + hash.digest("base64") + "\r\n" +
                   "Sec-WebSocket-Origin: " + request.headers.origin + "\r\n" +
                   "Sec-WebSocket-Location: ws://" + request.headers.host + request.url + "\r\n" +
                   "\r\n");
    //Handle WebSocket traffic
    var data = null;
    socket.on('data', function(frame) {
      try {
        while (frame) {
          var result = wsFrame.decode(frame);
          //Prepend any existing decoded data
          if (data) {
            if (result.data) {
              var newData = new Buffer(data.length + result.data.length);
              data.copy(newData);
              result.data.copy(newData, data.length);
              result.data = newData;
            } else {
              result.data = data;
            }
            data = null;
          }
          //If this completes a message process it
          if (result.FIN) {
            processWS(result.data, socket, svc, result.binEncoding);
          } else {
            data = result.data;
          }
          //Prepare next frame for decoding (if any)
          frame = result.nextFrame;
        }
      } catch(e) {
        log.error('TWebSocketTransport Exception: ' + e);
        socket.destroy();
      }
    });
  });

  //Return the server
  return server;
}