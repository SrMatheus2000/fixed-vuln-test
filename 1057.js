function compare(orig, compareTo, options, cb) {

    var isImageMagick = this._options && this._options.imageMagick;
    // compare binary for IM is `compare`, for GM it's `gm compare`
    var bin = isImageMagick ? '' : 'gm ';
    var args = ['compare', '-metric', 'mse', orig, compareTo]
    var tolerance = 0.4;
    // outputting the diff image
    if (typeof options === 'object') {

      if (options.highlightColor && options.highlightColor.indexOf('"') < 0) {
        options.highlightColor = '"' + options.highlightColor + '"';
      }

      if (options.file) {
        if (typeof options.file !== 'string') {
          throw new TypeError('The path for the diff output is invalid');
        }
         // graphicsmagick defaults to red
        if (options.highlightColour) {
            args.push('-highlight-color');
            args.push(options.highlightColor);
        }
        if (options.highlightStyle) {
            args.push('-highlight-style')
            args.push(options.highlightStyle)
        }
        // For IM, filename is the last argument. For GM it's `-file <filename>`
        if (isImageMagick) {
            args.push('-file');
        }
        args.push(options.file);
      }
      
      if (typeof options.tolerance != 'undefined') {
        if (typeof options.tolerance !== 'number') {
          throw new TypeError('The tolerance value should be a number');
        }
        tolerance = options.tolerance;
      } 
    } else {
      // For ImageMagick diff file is required but we don't care about it, so null it out
      if (isImageMagick) {
        args.push('null:');
      }

      if (typeof options == 'function') {
        cb = options; // tolerance value not provided, flip the cb place
      } else {
        tolerance = options
      }
    }

    var proc = spawn('/usr/bin/gm', args);
    var stdout = '';
    var stderr = '';
    proc.stdout.on('data',function(data) { stdout+=data });
    proc.stderr.on('data',function(data) { stderr+=data });
    proc.on('close', function (code) {
      // ImageMagick returns err code 2 if err, 0 if similar, 1 if dissimilar
      if (isImageMagick) {
        if (code === 0) {
          return cb(null, 0 <= tolerance, 0, stdout);
        }
        else if (code === 1) {
          err = null;
          stdout = stderr;
        } else {
        return cb(stderr);
        }
      } else {
        if(code !== 0) {
          return cb(stderr);
        }
      }
      // Since ImageMagick similar gives err code 0 and no stdout, there's really no matching
      // Otherwise, output format for IM is `12.00 (0.123)` and for GM it's `Total: 0.123`
      var regex = isImageMagick ? /\((\d+\.?[\d\-\+e]*)\)/m : /Total: (\d+\.?\d*)/m;
      var match = regex.exec(stdout);
      if (!match) {
        err = new Error('Unable to parse output.\nGot ' + stdout);
        return cb(err);
      }

      var equality = parseFloat(match[1]);
      cb(null, equality <= tolerance, equality, stdout, orig, compareTo);
    });
  }