function unique_name_568 (p) {
    if (typeof data[p] != 'undefined') {
      // Disallow passing potentially dangerous opts in the data
      // These opts should not be settable via a `render` call
      if (_OPTS_IN_DATA_BLACKLIST[p]) {
        return;
      }
      opts[p] = data[p];
    }
  }