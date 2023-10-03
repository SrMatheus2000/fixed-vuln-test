function unique_name_107(string) {

  if (this.navigating) return;

  string = string || this.input.value;

  var f = document.createDocumentFragment();

  // Remove message
  this.removeMessage();

  // Clear the dropdown
  util.truncate(this.tree);

  if (string.length > 1) {
    // Check the options for the matching string
    util.each(this.options, function(i, option) {
      var item = this.items[option.idx];
      var includes = util.includes(option.textContent.toLowerCase(), string.toLowerCase());

      if (includes && !option.disabled) {

        appendItem(item, f, this.customOption);

        util.removeClass(item, "excluded");

        // Underline the matching results
        if (!this.customOption) {
          item.textContent = match(string, option);
        }
      } else {
        util.addClass(item, "excluded");
      }
    }, this);


    if (!f.childElementCount) {
      if (!this.config.taggable) {
        this.setMessage("no results.");
      }
    } else {
      // Highlight top result (@binary-koan #26)
      var prevEl = this.items[this.navIndex];
      var firstEl = f.firstElementChild;

      util.removeClass(prevEl, "active");

      this.navIndex = firstEl.idx;

      util.addClass(firstEl, "active");
    }

  } else {
    render.call(this);
  }

  this.tree.appendChild(f);
}