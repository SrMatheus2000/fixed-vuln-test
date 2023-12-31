function unique_name_586(str) {
  // If `str` blank or an object
  if(!str || typeof(str) === 'object') {
    return $.text(this);
  } else if (_.isFunction(str)) {
    // Function support
    return this.each(function(i) {
      var self = $(this);
      return self.text(str.call(this, i, self.text()));
    });
  }

  var elem = {
    data : $.encode(str),
    type : 'text',
    parent : null,
    prev : null,
    next : null,
    children : []
  };

  // Append text node to each selected elements
  this.each(function() {
    this.children = elem;
    updateDOM(this.children, this);
  });

  return this;
}