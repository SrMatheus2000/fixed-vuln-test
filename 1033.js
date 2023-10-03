function unique_name_606(options, model) {
    var fragment = '';
    if (options.offset && !options.limit) {
      fragment += ' LIMIT ' + this.escape(options.offset) + ', ' + 18440000000000000000;
    } else if (options.limit) {
      if (options.offset) {
        fragment += ' LIMIT ' + this.escape(options.offset) + ', ' + this.escape(options.limit);
      } else {
        fragment += ' LIMIT ' + this.escape(options.limit);
      }
    }

    return fragment;
  }