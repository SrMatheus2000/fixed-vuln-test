function unique_name_344 (txn, res, params) {
  var inputs = [];
  
  Object.keys(params).forEach(function (k) {
    var encoded = params[k];
    if (typeof params[k] === 'string') {
      encoded = entities.encode(params[k]);
    }

    inputs.push(input.replace('{NAME}', k).replace('{VALUE}', encoded));
   });

  res.setHeader('Content-Type', 'text/html;charset=UTF-8');
  res.setHeader('Cache-Control', 'no-cache, no-store');
  res.setHeader('Pragma', 'no-cache');

  return res.end(html.replace('{ACTION}', entities.encode(txn.redirectURI)).replace('{INPUTS}', inputs.join('')));
}