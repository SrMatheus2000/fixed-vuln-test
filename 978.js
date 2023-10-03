function unique_name_567(callback) {
  var self = this;
  var _complete = function() {
    var err = self.$__.validationError;
    self.$__.validationError = undefined;
    self.emit('validate', self);
    if (err) {
      for (var key in err.errors) {
        // Make sure cast errors persist
        if (!self.__parent && err.errors[key] instanceof MongooseError.CastError) {
          self.invalidate(key, err.errors[key]);
        }
      }

      return err;
    } else {
      return;
    }
  };

  // only validate required fields when necessary
  var paths = Object.keys(this.$__.activePaths.states.require).filter(function(path) {
    if (!self.isSelected(path) && !self.isModified(path)) return false;
    return true;
  });

  paths = paths.concat(Object.keys(this.$__.activePaths.states.init));
  paths = paths.concat(Object.keys(this.$__.activePaths.states.modify));
  paths = paths.concat(Object.keys(this.$__.activePaths.states.default));

  if (0 === paths.length) {
    process.nextTick(function() {
      var err = _complete();
      if (err) {
        callback(err);
        return;
      }
      callback();
    });
  }

  var validating = {}
    , total = 0;

  // gh-661: if a whole array is modified, make sure to run validation on all
  // the children as well
  for (var i = 0; i < paths.length; ++i) {
    var path = paths[i];
    var val = self.getValue(path);
    if (val && val.isMongooseArray && !Buffer.isBuffer(val) &&
        !val.isMongooseDocumentArray) {
      var numElements = val.length;
      for (var j = 0; j < numElements; ++j) {
        paths.push(path + '.' + j);
      }
    }
  }

  var complete = function() {
    var err = _complete();
    if (err) {
      callback(err);
      return;
    }
    callback();
  };

  var validatePath = function(path) {
    if (validating[path]) return;

    validating[path] = true;
    total++;

    process.nextTick(function() {
      var p = self.schema.path(path);
      if (!p) {
        return --total || complete();
      }

      // If user marked as invalid or there was a cast error, don't validate
      if (!self.$isValid(path)) {
        --total || complete();
        return;
      }

      var val = self.getValue(path);
      p.doValidate(val, function(err) {
        if (err) {
          self.invalidate(path, err, undefined, true);
        }
        --total || complete();
      }, self);
    });
  };

  paths.forEach(validatePath);
}