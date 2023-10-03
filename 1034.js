function unique_name_607(options, model) {
    var fragment = '';
    var offset = options.offset || 0
      , isSubQuery = options.hasIncludeWhere || options.hasIncludeRequired || options.hasMultiAssociation;

    // FIXME: This is ripped from selectQuery to determine whether there is already
    //        an ORDER BY added for a subquery. Should be refactored so we dont' need
    //        the duplication. Also consider moving this logic inside the options.order
    //        check, so that we aren't compiling this twice for every invocation.
    var mainQueryOrder = [];
    var subQueryOrder = [];
    if (options.order) {
      if (Array.isArray(options.order)) {
        options.order.forEach(function(t) {
          if (!Array.isArray(t)) {
            if (isSubQuery && !(t instanceof Model) && !(t.model instanceof Model)) {
              subQueryOrder.push(this.quote(t, model));
            }
          } else {
            if (isSubQuery && !(t[0] instanceof Model) && !(t[0].model instanceof Model)) {
              subQueryOrder.push(this.quote(t, model));
            }
            mainQueryOrder.push(this.quote(t, model));
          }
        }.bind(this));
      } else {
        mainQueryOrder.push(options.order);
      }
    }

    if (options.limit || options.offset) {
      if (!options.order || (options.include && !subQueryOrder.length)) {
        fragment += (options.order && !isSubQuery) ? ', ' : ' ORDER BY ';
        fragment += this.quoteIdentifier(model.primaryKeyField);
      }

      if (options.offset || options.limit) {
        fragment += ' OFFSET ' + this.escape(offset) + ' ROWS';
      }

      if (options.limit) {
        fragment += ' FETCH NEXT ' + this.escape(options.limit) + ' ROWS ONLY';
      }
    }

    return fragment;
  }