function getLatestVersion(callback) {
  var url = 'https://selenium-release.storage.googleapis.com/?delimiter=/&prefix=';

  function onFullVersionData(error, result) {
    if (error != null) {
      return callback(error);
    }
    var parsed = parseSelenium(result);
    return callback(parsed.error, parsed.version);
  }

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

  return requestXml(url, onMinorVersionData);
}