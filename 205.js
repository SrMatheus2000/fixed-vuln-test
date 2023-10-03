(req, url, publicUrl, opt_nokey) => {
  if (!url || (typeof url !== 'string') || url.indexOf('local://') !== 0) {
    return url;
  }
  const queryParams = [];
  if (!opt_nokey && req.query.key) {
    queryParams.unshift(`key=${encodeURIComponent(req.query.key)}`);
  }
  let query = '';
  if (queryParams.length) {
    query = `?${queryParams.join('&')}`;
  }
  return url.replace(
    'local://', utils.getPublicUrl(publicUrl, req)) + query;
}