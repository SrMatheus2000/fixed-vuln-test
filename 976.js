function downloadToFile(filename, callback) {
        var writer;

        function dieOnError(e) {
            console.log(util.format('unable to download the libxl SDK: %s', e.message));
            console.log(util.format(
                '\nplease download libxl manually from https://www.libxl.com and point the environment variable %s to the downloaded file',
                archiveEnv
            ));

            process.exit(1);
        }

        function onOpen() {
            var url = util.format('https://www.libxl.com/download/%s', getArchiveName());

            console.log('Downloading ' + url);

            https.get(url, function(response) {
                if (response.statusCode !== 200) {
                    dieOnError(new Error(util.format('request failed: %s %s', response.statusCode, response.statusMessage)));
                }

                response.on('error', dieOnError);

                writer.on('finish', function() {
                    callback(filename);
                });

                response.pipe(writer);
            }).on('error', dieOnError);
        }

        writer = fs.createWriteStream(filename);
        writer.on('error', dieOnError);
        writer.on('open', onOpen);
    }