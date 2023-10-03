function unique_name_296(model, where, options) {
  var self = this;
  var query = {};
  if (where === null || typeof where !== 'object') {
    return query;
  }

  where = sanitizeFilter(where, options);

  var idName = self.idName(model);
  Object.keys(where).forEach(function(k) {
    var cond = where[k];
    if (k === 'and' || k === 'or' || k === 'nor') {
      if (Array.isArray(cond)) {
        cond = cond.map(function(c) {
          return self.buildWhere(model, c, options);
        });
      }
      query['$' + k] = cond;
      delete query[k];
      return;
    }
    if (k === idName) {
      k = '_id';
    }
    var propName = k;
    if (k === '_id') {
      propName = idName;
    }

    var prop = self.getPropertyDefinition(model, propName);

    // Convert property to database column name
    k = self.getDatabaseColumnName(model, k);

    var spec = false;
    var options = null;
    if (cond && cond.constructor.name === 'Object') {
      options = cond.options;
      spec = Object.keys(cond)[0];
      cond = cond[spec];
    }
    if (spec) {
      if (spec === 'between') {
        query[k] = {$gte: cond[0], $lte: cond[1]};
      } else if (spec === 'inq') {
        cond = [].concat(cond || []);
        query[k] = {
          $in: cond.map(function(x) {
            if (self.isObjectIDProperty(model, prop, x)) return ObjectID(x);
            return x;
          }),
        };
      } else if (spec === 'nin') {
        cond = [].concat(cond || []);
        query[k] = {
          $nin: cond.map(function(x) {
            if (self.isObjectIDProperty(model, prop, x)) return ObjectID(x);
            return x;
          }),
        };
      } else if (spec === 'like') {
        if (cond instanceof RegExp) {
          query[k] = {$regex: cond};
        } else {
          query[k] = {$regex: new RegExp(cond, options)};
        }
      } else if (spec === 'nlike') {
        if (cond instanceof RegExp) {
          query[k] = {$not: cond};
        } else {
          query[k] = {$not: new RegExp(cond, options)};
        }
      } else if (spec === 'neq') {
        query[k] = {$ne: cond};
      } else if (spec === 'regexp') {
        if (cond.global)
          g.warn('{{MongoDB}} regex syntax does not respect the {{`g`}} flag');

        query[k] = {$regex: cond};
      } else {
        query[k] = {};
        query[k]['$' + spec] = cond;
      }
    } else {
      if (cond === null) {
        // http://docs.mongodb.org/manual/reference/operator/query/type/
        // Null: 10
        query[k] = {$type: 10};
      } else {
        if (self.isObjectIDProperty(model, prop, cond)) {
          cond = ObjectID(cond);
        }
        query[k] = cond;
      }
    }
  });
  return query;
}