function unique_name_684(req, res, fields) {
  res.header("Content-Type", "application/json; charset=utf-8");

  apiLogger.info("REQUEST, v"+ req.params.version + ":" + req.params.func + ", " + JSON.stringify(fields));

  //wrap the send function so we can log the response
  //note: res._send seems to be already in use, so better use a "unique" name
  res._____send = res.send;
  res.send = function (response) {
    response = JSON.stringify(response);
    apiLogger.info("RESPONSE, " + req.params.func + ", " + response);

    //is this a jsonp call, if yes, add the function call
    if(req.query.jsonp && isVarName(response))
      response = req.query.jsonp + "(" + response + ")";

    res._____send(response);
  }

  //call the api handler
  apiHandler.handle(req.params.version, req.params.func, fields, req, res);
}