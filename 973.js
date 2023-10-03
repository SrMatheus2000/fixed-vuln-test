function unique_name_564( url ){
    var promise = new RSVP.Promise();
    var urlArr = url.split( "/" );
    var installerFilename = urlArr[ urlArr.length - 1 ];
    var dest = path.resolve( path.join( __dirname , '..' , installerFilename ) );
    var maxRedirects = 3; // Capped at 3. Should be adequate.
    var redirectCount = 0;
    var file = fs.createWriteStream( dest );
    var isWin = path.extname( installerFilename ) === ".exe";

    file.on('open',function(fd){
      var getDownload = function(url){
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
      };

      getDownload(url);

    }).on( 'error' , function( err ){
      console.log('File error');
      promise.reject( err );
    });

    return promise;
  }