function unique_name_246 () {
    const opts = this.element.find('option:selected');
    let text = this.getOptionText(opts);

    if (opts.hasClass('clear')) {
      text = '';
    }

    if (this.settings.empty && opts.length === 0) {
      this.pseudoElem.find('span')[0].innerHTML = `<span class="audible">${this.label.text()} </span>`;
      return;
    }

    // Displays the text on the pseudo-element
    const maxlength = this.element.attr('maxlength');
    if (maxlength) {
      text = text.substr(0, maxlength);
    }
    text = text.trim();
    this.pseudoElem.find('span')[0].innerHTML = `<span class="audible">${this.label.text()} </span>${text}`;

    // If there is a placeholder set the selected text
    if (this.element.attr('placeholder')) {
      this.pseudoElem.find('span').not('.audible').attr('data-selected-text', text);
    }

    // Set the "previousActiveDescendant" to the first of the items
    this.previousActiveDescendant = opts.first().val();

    this.updateItemIcon(opts);
    this.setBadge(opts);
  }