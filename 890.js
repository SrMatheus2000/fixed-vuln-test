function unique_name_501 (container, options = {}) {
    options = expandConfig(container, options);
    this.container = options.container;
    if (this.container == null) {
      return debug.error('Invalid Quill container', container);
    }
    if (options.debug) {
      Quill.debug(options.debug);
    }
    let html = this.container.innerHTML.trim();
    this.container.classList.add('ql-container');
    this.container.innerHTML = '';
    this.root = this.addContainer('ql-editor');
    this.emitter = new Emitter();
    this.scroll = Parchment.create(this.root, {
      emitter: this.emitter,
      whitelist: options.formats
    });
    this.editor = new Editor(this.scroll, this.emitter);
    this.selection = new Selection(this.scroll, this.emitter);
    this.theme = new options.theme(this, options);
    this.keyboard = this.theme.addModule('keyboard');
    this.clipboard = this.theme.addModule('clipboard');
    this.history = this.theme.addModule('history');
    this.theme.init();
    let contents = this.clipboard.convert(`<div class='ql-editor' style="white-space: normal;">${html}<p><br></p></div>`);
    this.setContents(contents);
    this.history.clear();
    if (options.readOnly) {
      this.disable();
    }
    if (options.placeholder) {
      this.root.setAttribute('data-placeholder', options.placeholder);
    }
    this.root.classList.toggle('ql-blank', this.editor.isBlank());
    this.emitter.on(Emitter.events.TEXT_CHANGE, (delta) => {
      this.root.classList.toggle('ql-blank', this.editor.isBlank());
    });
  }