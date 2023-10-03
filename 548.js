function optimizedFindOrCreate(model, filter, data, options, callback) {
  var self = this;
  if (self.debug) {
    debug('findOrCreate', model, filter, data);
  }

  if (!callback) callback = options;

  var idValue = self.getIdValue(model, data);
  var idName = self.idName(model);

  if (idValue == null) {
    delete data[idName]; // Allow MongoDB to generate the id
  } else {
    var oid = self.coerceId(model, idValue); // Is it an Object ID?
    data._id = oid; // Set it to _id
    if (idName !== '_id') {
      delete data[idName];
    }
  }

  filter = filter || {};
  var query = {};
  if (filter.where) {
    if (filter.where[idName]) {
      var id = filter.where[idName];
      delete filter.where[idName];
      id = self.coerceId(model, id);
      filter.where._id = id;
    }
    query = self.buildWhere(model, filter.where, options);
  }

  var sort = self.buildSort(model, filter.order, options);

  this.collection(model).findOneAndUpdate(
    query,
    {$setOnInsert: data},
    {projection: filter.fields, sort: sort, upsert: true},
    function(err, result) {
      if (self.debug) {
        debug('findOrCreate.callback', model, filter, err, result);
      }
      if (err) {
        return callback(err);
      }

      var value = result.value;
      var created = !!result.lastErrorObject.upserted;

      if (created && (value == null || Object.keys(value).length == 0)) {
        value = data;
        self.setIdValue(model, value, result.lastErrorObject.upserted);
      } else {
        value = self.fromDatabase(model, value);
        self.setIdValue(model, value, value._id);
      }

      if (value && idName !== '_id') {
        delete value._id;
      }

      if (filter && filter.include) {
        self._models[model].model.include([value], filter.include, function(
          err,
          data
        ) {
          callback(err, data[0], created);
        });
      } else {
        callback(null, value, created);
      }
    }
  );
}