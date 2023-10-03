function unique_name_512(key, value, options) {
    options = options || {};

    var self = this
      , binding
      , outerBinding
      , comparatorMap
      , aliasMap
      , comparator = '='
      , field = options.field || options.model && options.model.rawAttributes && options.model.rawAttributes[key] || options.model && options.model.fieldRawAttributesMap && options.model.fieldRawAttributesMap[key]
      , fieldType = options.type || (field && field.type)
      , tmp;

    if (key && typeof key === 'string' && key.indexOf('.') !== -1 && options.model) {
      if (options.model.rawAttributes[key.split('.')[0]] && options.model.rawAttributes[key.split('.')[0]].type instanceof DataTypes.JSON) {
        field = options.model.rawAttributes[key.split('.')[0]];
        fieldType = field.type;
        tmp = value;
        value = {};

        Dottie.set(value, key.split('.').slice(1), tmp);
        key = field.field || key.split('.')[0];
      }
    }

    comparatorMap = {
      $eq: '=',
      $ne: '!=',
      $gte: '>=',
      $gt: '>',
      $lte: '<=',
      $lt: '<',
      $not: 'IS NOT',
      $is: 'IS',
      $like: 'LIKE',
      $notLike: 'NOT LIKE',
      $iLike: 'ILIKE',
      $notILike: 'NOT ILIKE',
      $between: 'BETWEEN',
      $notBetween: 'NOT BETWEEN',
      $overlap: '&&',
      $contains: '@>',
      $contained: '<@'
    };

    // Maintain BC
    aliasMap = {
      'ne': '$ne',
      'in': '$in',
      'not': '$not',
      'notIn': '$notIn',
      'gte': '$gte',
      'gt': '$gt',
      'lte': '$lte',
      'lt': '$lt',
      'like': '$like',
      'ilike': '$iLike',
      '$ilike': '$iLike',
      'nlike': '$notLike',
      '$notlike': '$notLike',
      'notilike': '$notILike',
      '..': '$between',
      'between': '$between',
      '!..': '$notBetween',
      'notbetween': '$notBetween',
      'nbetween': '$notBetween',
      'overlap': '$overlap',
      '&&': '$overlap',
      '@>': '$contains',
      '<@': '$contained'
    };

    key = aliasMap[key] || key;
    if (_.isPlainObject(value)) {
      _.forOwn(value, function (item, key) {
        if (aliasMap[key]) {
          value[aliasMap[key]] = item;
          delete value[key];
        }
      });
    }

    if (key === undefined) {
      if (typeof value === 'string') {
        return value;
      }

      if (_.isPlainObject(value) && _.size(value) === 1) {
        key = Object.keys(value)[0];
        value = _.values(value)[0];
      }
    }

    if (value && value._isSequelizeMethod && !(key !== undefined && value instanceof Utils.fn)) {
      return this.handleSequelizeMethod(value);
    }

    // Convert where: [] to $and if possible, else treat as literal/replacements
    if (key === undefined && Array.isArray(value)) {
      if (Utils.canTreatArrayAsAnd(value)) {
        key = '$and';
      } else {
        return Utils.format(value, this.dialect);
      }
    }
    // OR/AND/NOT grouping logic
    if (key === '$or' || key === '$and' || key === '$not') {
      binding = (key === '$or') ?' OR ' : ' AND ';
      outerBinding = '';
      if (key === '$not') outerBinding = 'NOT ';

      if (Array.isArray(value)) {
        value = value.map(function (item) {
          var itemQuery = self.whereItemsQuery(item, options, ' AND ');
          if ((Array.isArray(item) || _.isPlainObject(item)) && _.size(item) > 1) {
            itemQuery = '('+itemQuery+')';
          }
          return itemQuery;
        }).filter(function (item) {
          return item && item.length;
        });

        return value.length ? outerBinding + '('+value.join(binding)+')' : undefined;
      } else {
        value = self.whereItemsQuery(value, options, binding);
        return value ? outerBinding + '('+value+')' : undefined;
      }
    }

    if (value && (value.$or || value.$and)) {
      binding = value.$or ? ' OR ' : ' AND ';
      value = value.$or || value.$and;

      if (_.isPlainObject(value)) {
        value = _.reduce(value, function (result, _value, key) {
          result.push(_.zipObject([key], [_value]));
          return result;
        }, []);
      }

      value = value.map(function (_value) {
        return self.whereItemQuery(key, _value, options);
      }).filter(function (item) {
        return item && item.length;
      });

      return value.length ? '('+value.join(binding)+')' : undefined;
    }

    if (_.isPlainObject(value) && fieldType instanceof DataTypes.JSON && options.json !== false) {
      return (function () {
        var $items = []
          , result
          , traverse;

        traverse = function (prop, item, path) {
          var $where = {}
            , $key
            , $cast
            , $baseKey
            , $tmp
            , castKey;

          if (path[path.length - 1].indexOf('::') > -1) {
            $tmp = path[path.length - 1].split('::');
            $cast = $tmp[1];
            path[path.length - 1] = $tmp[0];
          }

          $baseKey = self.quoteIdentifier(key)+'#>>\'{'+path.join(', ')+'}\'';

          if (options.prefix) {
            if (options.prefix instanceof Utils.literal) {
              $baseKey = self.handleSequelizeMethod(options.prefix)+'.'+$baseKey;
            } else {
              $baseKey = self.quoteTable(options.prefix)+'.'+$baseKey;
            }
          }

          $baseKey = '('+$baseKey+')';

          castKey = function ($item) {
            var key = $baseKey;

            if (!$cast) {
              if (typeof $item === 'number') {
                $cast = 'double precision';
              } else if ($item instanceof Date) {
                $cast = 'timestamptz';
              } else if (typeof $item === 'boolean') {
                $cast = 'boolean';
              }
            }

            if ($cast) {
              key += '::'+$cast;
            }

            return key;
          };

          if (_.isPlainObject(item)) {
            _.forOwn(item, function ($item, $prop) {
              if ($prop.indexOf('$') === 0) {
                $where[$prop] = $item;
                $key = castKey($item);

                $items.push(self.whereItemQuery(new Utils.literal($key), $where/*, _.pick(options, 'prefix')*/));
              } else {
                traverse($prop, $item, path.concat([$prop]));
              }
            });
          } else {
            $where.$eq = item;
            $key = castKey(item);

            $items.push(self.whereItemQuery(new Utils.literal($key), $where/*, _.pick(options, 'prefix')*/));
          }
        };

        _.forOwn(value, function (item, prop) {
          if (prop.indexOf('$') === 0) {
            var $where = {};
            $where[prop] = item;
            $items.push(self.whereItemQuery(key, $where, _.assign({}, options, {json: false})));
            return;
          }

          traverse(prop, item, [prop]);
        });

        result = $items.join(' AND ');
        return $items.length > 1 ? '('+result+')' : result;
      })();
    }

    // If multiple keys we combine the different logic conditions
    if (_.isPlainObject(value) && Object.keys(value).length > 1) {
      return (function () {
        var $items = [];
        _.forOwn(value, function (item, logic) {
          var $where = {};
          $where[logic] = item;
          $items.push(self.whereItemQuery(key, $where, options));
        });

        return '('+$items.join(' AND ')+')';
      })();
    }

    // Do [] to $in/$notIn normalization
    if (value && (!fieldType || !(fieldType instanceof DataTypes.ARRAY))) {
      if (Array.isArray(value)) {
        value = {
          $in: value
        };
      } else if (value && Array.isArray(value.$not)) {
        value.$notIn = value.$not;
        delete value.$not;
      }
    }

    // normalize $not: non-bool|non-null to $ne
    if (value && typeof value.$not !== 'undefined' && [null, true, false].indexOf(value.$not) < 0) {
      value.$ne = value.$not;
      delete value.$not;
    }

    // Setup keys and comparators
    if (Array.isArray(value) && fieldType instanceof DataTypes.ARRAY) {
      value = this.escape(value, field);
    } else if (value && (value.$in || value.$notIn)) {
      comparator = 'IN';
      if (value.$notIn) comparator = 'NOT IN';

      if ((value.$in || value.$notIn) instanceof Utils.literal) {
        value = (value.$in || value.$notIn).val;
      } else if ((value.$in || value.$notIn).length) {
        value = '('+(value.$in || value.$notIn).map(function (item) {
          return self.escape(item);
        }).join(', ')+')';
      } else {
        value = '(NULL)';
      }
    } else if (value && (value.$any || value.$all)) {
      comparator = value.$any ? '= ANY' : '= ALL';
      if (value.$any && value.$any.$values || value.$all && value.$all.$values) {
        value = '(VALUES '+(value.$any && value.$any.$values || value.$all && value.$all.$values).map(function (value) {
          return '('+this.escape(value)+')';
        }.bind(this)).join(', ')+')';
      } else {
        value = '('+this.escape(value.$any || value.$all, field)+')';
      }
    } else if (value && (value.$between || value.$notBetween)) {
      comparator = 'BETWEEN';
      if (value.$notBetween) comparator = 'NOT BETWEEN';

      value = (value.$between || value.$notBetween).map(function (item) {
        return self.escape(item);
      }).join(' AND ');
    } else if (value && value.$raw) {
      value = value.$raw;
    } else if (value && value.$col) {
      value = value.$col.split('.').map(this.quoteIdentifier.bind(this)).join('.');
    } else {
      var escapeValue = true;

      if (_.isPlainObject(value)) {
        _.forOwn(value, function (item, key) {
          if (comparatorMap[key]) {
            comparator = comparatorMap[key];
            value = item;

            if (_.isPlainObject(value) && value.$any) {
              comparator += ' ANY';
              value = value.$any;
            } else if (_.isPlainObject(value) && value.$all) {
              comparator += ' ALL';
              value = value.$all;
            } else if (value && value.$col) {
              escapeValue = false;
              value = this.whereItemQuery(null, value);
            }
          }
        }, this);
      }

      if (comparator === '=' && value === null) {
        comparator = 'IS';
      } else if (comparator === '!=' && value === null) {
        comparator = 'IS NOT';
      }

      if (escapeValue) {
        value = this.escape(value, field);
      }
    }

    if (key) {
      var prefix = true;
      if (key._isSequelizeMethod) {
        key = this.handleSequelizeMethod(key);
      } else if (Utils.isColString(key)) {
        key = key.substr(1, key.length - 2).split('.').map(this.quoteIdentifier.bind(this)).join('.');
        prefix = false;
      } else {
        key = this.quoteIdentifier(key);
      }

      if (options.prefix && prefix) {
        if (options.prefix instanceof Utils.literal) {
          key = [this.handleSequelizeMethod(options.prefix), key].join('.');
        } else {
          key = [this.quoteTable(options.prefix), key].join('.');
        }
      }
      return [key, value].join(' '+comparator+' ');
    }
    return value;
  }