function onMinorVersionData(error, result) {
    if (error != null) {
      return callback(error);
    }
    var parsedMinor = parseSeleniumMinor(result);
    if (parsedMinor.error) {
      return callback(parsedMinor.error);
    }
    var prefixedUrl =
      'https://selenium-release.storage.googleapis.com/?delimiter=/&prefix=' +
      parsedMinor.minorVersion + '/';
    return requestXml(prefixedUrl, onFullVersionData);
  }