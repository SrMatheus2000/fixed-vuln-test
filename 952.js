function getChromedriverUrl() {
  var urlBase;
  if (process.env.CHROMEDRIVER_BASE_URL) {
    urlBase = process.env.CHROMEDRIVER_BASE_URL;
  } else {
    urlBase = 'http://chromedriver.storage.googleapis.com/2.25/';
  }

  switch (os.platform()) {
    case 'darwin':
      return urlBase + 'chromedriver_mac64.zip';
    case 'linux':
      return urlBase + ((os.arch() === 'x64') ? 'chromedriver_linux64.zip' : 'chromedriver_linux32.zip');
    case 'win32':
      return urlBase + 'chromedriver_win32.zip';
    default:
      throw new Error('Unsupported platform: ' + os.platform());
  }
}