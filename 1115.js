function unique_name_669 (method, reqUrl, params, reqObj, respObj) {
    var staticPath
      , controllerInst
      , nonMethodRoutes;


    // Get the path to the file, decoding the request URI
    staticPath = path.resolve(path.join(this.config.staticFilePath, decodeURIComponent(reqUrl)));

    // Prevent directory traversal
    if (staticPath.indexOf(this.config.staticFilePath) !== 0) {
      this.handleNotFound(reqUrl, params, reqObj, respObj);
      return;
    }

    // Ignore querystring
    staticPath = staticPath.split('?')[0];

    // Static?
    if (utils.file.existsSync(staticPath)) {
      this.handleStaticFile(staticPath, params, reqUrl, reqObj, respObj, params);
    }
    else {
      nonMethodRoutes = this.router.all(reqUrl);

      // Good route, wrong verb -- 405?
      if (nonMethodRoutes.length) {
        this.handleMethodNotAllowed(method, reqUrl, params, reqObj, respObj,
          nonMethodRoutes);
      }
      // Nada, 404
      else {
        this.handleNotFound(reqUrl, params, reqObj, respObj);
      }
    }
  }