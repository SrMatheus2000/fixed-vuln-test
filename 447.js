function unique_name_233 () {
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

          var pathKey = self.escape('{' + path.join(', ') + '}');
          $baseKey = self.quoteIdentifier(key)+'#>>'+pathKey;

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
      }