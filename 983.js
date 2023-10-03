function buildDownloadUrl(version, minorVersion) {
  return 'https://selenium-release.storage.googleapis.com/' + minorVersion +
    '/selenium-server-standalone-' + version + '.jar';
}