function unique_name_256(val) {
    this.hidePopover();
    this.textarea.val(val);
    this.body.get(0).innerHTML = DOMPurify ? DOMPurify.sanitize(val) : val;
    this.formatter.format();
    this.formatter.decorate();
    this.util.reflow(this.body);
    this.inputManager.lastCaretPosition = null;
    return this.trigger('valuechanged');
  }