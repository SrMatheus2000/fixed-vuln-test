function unique_name_595(val, secret){
  if ('string' != typeof val) throw new TypeError('cookie required');
  if ('string' != typeof secret) throw new TypeError('secret required');
  var str = val.slice(0, val.lastIndexOf('.'))
    , mac = exports.sign(str, secret);
  
  return sha1(mac) == sha1(val) ? str : false;
}