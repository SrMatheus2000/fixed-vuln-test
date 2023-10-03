function requestListener(req, res) {
  var uri, file, data;

  current_url = path.normalize(req.url);

  uri = decodeURIComponent(url.parse(current_url).pathname);

  file = path.normalize(path.join(process.cwd(), uri));
  acceptEncoding = req.headers['accept-encoding'];
  data = routes.get(req.url);

  if (data) {
    sendReponse(res, data);
    return;
  }

  fs.exists(file, function (exists) {
    if (exists) {
      checkFile(res, file);

    } else {
      res.writeHead(404);
      res.end('... Error: file not found.');
      return;
    }
  });
}