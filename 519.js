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