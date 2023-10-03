function unique_name_562(url){
        console.log('GET: ' +url);
        var protocol = URL.parse(url).protocol.replace(":","")
        var httpLib = protocol === 'https' ? https : http;
        httpLib.get(url,function(response){
          console.log('Status: '+response.statusCode);

          if( response.statusCode === 302 && maxRedirects > redirectCount ){
            redirectCount++;
            console.log("\nRedirecting...\n");
            return getDownload(response.headers.location);
          } else if ( response.statusCode == 404 ) {
            promise.reject('404 - File not found');
            return;
          } else {
            console.log('\nDownloading '+installerFilename+'...');
          }

          var r = response.pipe( file );

          r.on( 'close' , function() {
            console.log('Download complete!\n');

            var destRelative = dest;
            if(~dest.indexOf('/node_modules/')){
              destRelative = "./node_modules/"+dest.split('/node_modules/')[1];
            }

            // Test the validity of the downloaded archive
            // Only works on unix systems.
            // TODO: Check for gunzip (?)
            if( !isWin ){
              execFile( "gunzip", ["-t", dest], function(err, stdout, stderr){
                if( err || stderr ){
                  console.log( ''+installerFilename+' is not a valid tar archive.' );
                  promise.reject(err);
                } else {
                  console.log( ''+installerFilename+' is a valid tar archive.' );
                  promise.resolve( dest );
                }
              });
            } else {
              promise.resolve( dest );
            }
          });
        }).on( 'error' , function( err ){
          console.log('Request error');
          promise.reject( err );
        });
      }