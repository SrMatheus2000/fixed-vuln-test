function unique_name_109(index) {

  var item = this.items[index],
      options = [].slice.call(this.el.options),
      option = this.options[index];

  if (this.el.multiple) {
    if (util.includes(this.selectedIndexes, index)) {
      return false;
    }

    if (this.config.maxSelections && this.tags.length === this.config.maxSelections) {
      this.setMessage("A maximum of " + this.config.maxSelections + " items can be selected.", true);
      return false;
    }

    this.selectedValues.push(option.value);
    this.selectedIndexes.push(index);

    addTag.call(this, item);
  } else {
    var data = this.data ? this.data[index] : option;
    this.label.textContent = this.customSelected ? this.config.renderSelection(data) : option.textContent;

    this.selectedValue = option.value;
    this.selectedIndex = index;

    util.each(this.options, function(i, o) {
      var opt = this.items[i];

      if (i !== index) {
        if (opt) {
          util.removeClass(opt, "selected");
        }
        o.selected = false;
        o.removeAttribute("selected");
      }
    }, this);
  }

  if (!util.includes(options, option)) {
    this.el.add(option);
  }

  item.setAttribute("aria-selected", true);

  util.addClass(item, "selected");
  util.addClass(this.container, "has-selected");

  option.selected = true;
  option.setAttribute("selected", "");

  this.emit("selectr.change", option);

  this.emit("selectr.select", option);
}