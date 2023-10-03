function sanitizeUrl(url) {
  try {
    const decoded = decodeURIComponent(url)
      .replace(/[^A-Za-z0-9/:]/g, '');

    if (decoded.match(/^\s*(javascript|vbscript|data):/i)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          'Anchor URL contains an unsafe JavaScript/VBScript/data expression, it will not be rendered.',
          decoded
        );
      }

      return null;
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'Anchor URL could not be decoded due to malformed syntax or characters, it will not be rendered.',
        url
      );
    }

    // decodeURIComponent sometimes throws a URIError
    // See `decodeURIComponent('a%AFc');`
    // http://stackoverflow.com/questions/9064536/javascript-decodeuricomponent-malformed-uri-exception
    return null;
  }

  return url;
}