function unique_name_570 (conf) {
    tmpPath = findSuitableTempDirectory(conf);
    var platform = process.platform;
    // offer safari driver installation
    if (platform === 'darwin') {
      var npmconfDeferred = kew.defer();
      npmconf.load(npmconfDeferred.makeNodeResolver());
      npmconfDeferred.promise.then(function () {
        var downloadUrl = process.env.SAFARIDRIVER_CDNURL ||
          'https://selenium-release.storage.googleapis.com/2.48/SafariDriver.safariextz';
        var fileName = downloadUrl.split('/').pop();
        var downloadedFile = path.join(tmpPath, fileName);
        if (!fs.existsSync(downloadedFile)) {
          console.log('Downloading', downloadUrl);
          return requestBinary(downloadUrl, downloadedFile);
        } else {
          console.log('Download already available at', downloadedFile);
          return downloadedFile;
        }
      }).then(function (downloadedFile) {
        // request to open safari extension installation
        var spawn = require('child_process').spawn;
        console.log('Opening file ', downloadedFile);
        spawn('open', [downloadedFile], {
          detached: true
        });
        exit(0);
      }).fail(function (err) {
        console.error('Safari Driver installation failed', err, err.stack);
        exit(1);
      });
    } else {
      exit(0);
    }
  }