function fixUrl(url, protocol) {
  if (!url) {
    return url;
  }

  protocol = protocol || 'http';

  // does it start with desired protocol?
  if ((new RegExp('^' + protocol + ':\/\/', 'i')).test(url)) {
    return url;
  }

  // if we have a different protocol, then invalidate
  if (/^\w+:\/\//i.test(url)) {
    return null;
  }

  // apply protocol to "abc.com/abc"
  if (/^(?:\w+)(?:\.\w{2,})+(?:\/.*)?/.test(url)) {
    return protocol + '://' + url;
  }

  return null;
}