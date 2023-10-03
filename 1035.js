function unique_name_608(options) {
    var fragment = '';
    if (options.limit) fragment += ' LIMIT ' + this.escape(options.limit);
    if (options.offset) fragment += ' OFFSET ' + this.escape(options.offset);

    return fragment;
  }