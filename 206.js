(req, domains, path, format, publicUrl, aliases) => {

  if (domains) {
    if (domains.constructor === String && domains.length > 0) {
      domains = domains.split(',');
    }
    const host = req.headers.host;
    const hostParts = host.split('.');
    const relativeSubdomainsUsable = hostParts.length > 1 &&
      !/^([0-9]{1,3}\.){3}[0-9]{1,3}(\:[0-9]+)?$/.test(host);
    const newDomains = [];
    for (const domain of domains) {
      if (domain.indexOf('*') !== -1) {
        if (relativeSubdomainsUsable) {
          const newParts = hostParts.slice(1);
          newParts.unshift(domain.replace('*', hostParts[0]));
          newDomains.push(newParts.join('.'));
        }
      } else {
        newDomains.push(domain);
      }
    }
    domains = newDomains;
  }
  if (!domains || domains.length == 0) {
    domains = [req.headers.host];
  }

  const key = req.query.key;
  const queryParams = [];
  if (req.query.key) {
    queryParams.push(`key=${encodeURIComponent(req.query.key)}`);
  }
  if (req.query.style) {
    queryParams.push(`style=${req.query.style}`);
  }
  const query = queryParams.length > 0 ? (`?${queryParams.join('&')}`) : '';

  if (aliases && aliases[format]) {
    format = aliases[format];
  }

  const uris = [];
  if (!publicUrl) {
    for (const domain of domains) {
      uris.push(`${req.protocol}://${domain}/${path}/{z}/{x}/{y}.${format}${query}`);
    }
  } else {
    uris.push(`${publicUrl}${path}/{z}/{x}/{y}.${format}${query}`)
  }

  return uris;
}