function unique_name_181 () {
    const opts = this.element.find('option:selected');
    let text = this.getOptionText(opts);

    if (opts.hasClass('clear')) {
      text = '';
    }

    if (this.settings.empty && opts.length === 0) {
      let span = this.pseudoElem.find('span').first();
      DOM.html(span, `<span class="audible">${this.label.text()} </span>`, '<div><p><span><ul><li><a><abbr><b><i><kbd><small><strong><sub><svg><use><br>');
      span = $(`#${this.element.attr('id')}`).next().find('span').first();
      DOM.html(span, `<span class="audible">${this.label.text()} </span>`, '<div><p><span><ul><li><a><abbr><b><i><kbd><small><strong><sub><svg><use><br>');
      this.setPlaceholder(text);
      return;
    }

    // Displays the text on the pseudo-element
    const maxlength = this.element.attr('maxlength');
    if (maxlength) {
      text = text.substr(0, maxlength);
    }
    text = text.trim();
    const span = this.pseudoElem.find('span');
    if (span.length > 0) {
      span[0].innerHTML = `<span class="audible">${this.label.text()} </span>${xssUtils.escapeHTML(text)}`;
    }

    this.setPlaceholder(text);

    // Set the "previousActiveDescendant" to the first of the items
    this.previousActiveDescendant = opts.first().val();

    this.updateItemIcon(opts);
    this.setBadge(opts);
  }