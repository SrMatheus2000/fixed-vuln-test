function unique_name_522(key, value, writeAttr, attrName) {
        // TODO: decide whether or not to throw an error if "class"
        //is set through this function since it may cause $updateClass to
        //become unstable.

        var node = this.$$element[0],
            booleanKey = getBooleanAttrName(node, key),
            aliasedKey = getAliasedAttrName(key),
            observer = key,
            nodeName;

        if (booleanKey) {
          this.$$element.prop(key, value);
          attrName = booleanKey;
        } else if (aliasedKey) {
          this[aliasedKey] = value;
          observer = aliasedKey;
        }

        this[key] = value;

        // translate normalized key to actual key
        if (attrName) {
          this.$attr[key] = attrName;
        } else {
          attrName = this.$attr[key];
          if (!attrName) {
            this.$attr[key] = attrName = snake_case(key, '-');
          }
        }

        nodeName = nodeName_(this.$$element);

        if ((nodeName === 'a' && (key === 'href' || key === 'xlinkHref')) ||
            (nodeName === 'img' && key === 'src')) {
          // sanitize a[href] and img[src] values
          this[key] = value = $$sanitizeUri(value, key === 'src');
        } else if (nodeName === 'img' && key === 'srcset') {
          // sanitize img[srcset] values
          var result = "";

          // first check if there are spaces because it's not the same pattern
          var trimmedSrcset = trim(value);
          //                (   999x   ,|   999w   ,|   ,|,   )
          var srcPattern = /(\s+\d+x\s*,|\s+\d+w\s*,|\s+,|,\s+)/;
          var pattern = /\s/.test(trimmedSrcset) ? srcPattern : /(,)/;

          // split srcset into tuple of uri and descriptor except for the last item
          var rawUris = trimmedSrcset.split(pattern);

          // for each tuples
          var nbrUrisWith2parts = Math.floor(rawUris.length / 2);
          for (var i = 0; i < nbrUrisWith2parts; i++) {
            var innerIdx = i * 2;
            // sanitize the uri
            result += $$sanitizeUri(trim(rawUris[innerIdx]), true);
            // add the descriptor
            result += (" " + trim(rawUris[innerIdx + 1]));
          }

          // split the last item into uri and descriptor
          var lastTuple = trim(rawUris[i * 2]).split(/\s/);

          // sanitize the last uri
          result += $$sanitizeUri(trim(lastTuple[0]), true);

          // and add the last descriptor if any
          if (lastTuple.length === 2) {
            result += (" " + trim(lastTuple[1]));
          }
          this[key] = value = result;
        }

        if (writeAttr !== false) {
          if (value === null || isUndefined(value)) {
            this.$$element.removeAttr(attrName);
          } else {
            this.$$element.attr(attrName, value);
          }
        }

        // fire observers
        var $$observers = this.$$observers;
        $$observers && forEach($$observers[observer], function(fn) {
          try {
            fn(value);
          } catch (e) {
            $exceptionHandler(e);
          }
        });
      }