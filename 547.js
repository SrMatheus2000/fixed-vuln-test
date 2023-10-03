function all(model, filter, options, callback) {
  var self = this;
  if (self.debug) {
    debug('all', model, filter);
  }
  filter = filter || {};
  var idName = self.idName(model);
  var query = {};
  if (filter.where) {
    query = self.buildWhere(model, filter.where, options);
  }
  var fields = filter.fields;

  // Convert custom column names
  fields = self.fromPropertyToDatabaseNames(model, fields);

  if (fields) {
    // convert the array of fields into a projection object see http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#find
    var findOpts = {projection: fields};
    this.execute(model, 'find', query, findOpts, processResponse);
  } else {
    this.execute(model, 'find', query, processResponse);
  }

  function processResponse(err, cursor) {
    if (err) {
      return callback(err);
    }

    // don't apply sorting if dealing with a geo query
    if (!hasNearFilter(filter.where)) {
      var order = self.buildSort(model, filter.order, options);
      cursor.sort(order);
    }

    if (filter.limit) {
      cursor.limit(filter.limit);
    }
    if (filter.skip) {
      cursor.skip(filter.skip);
    } else if (filter.offset) {
      cursor.skip(filter.offset);
    }

    var shouldSetIdValue = idIncluded(fields, idName);
    var deleteMongoId = fields || idName !== '_id';

    cursor.toArray(function(err, data) {
      if (self.debug) {
        debug('all', model, filter, err, data);
      }
      if (err) {
        return callback(err);
      }
      var objs = data.map(function(o) {
        if (shouldSetIdValue) {
          self.setIdValue(model, o, o._id);
        }
        // Don't pass back _id if the fields is set
        if (deleteMongoId) {
          delete o._id;
        }

        o = self.fromDatabase(model, o);
        return o;
      });
      if (filter && filter.include) {
        self._models[model].model.include(
          objs,
          filter.include,
          options,
          callback
        );
      } else {
        callback(null, objs);
      }
    });
  }
}