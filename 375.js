function unique_name_189 () {
    let isAppended = false;

    this.element = $(`${'<div class="modal">' +
        '<div class="modal-content" style="max-width: '}${this.settings.maxWidth ? this.settings.maxWidth : ''}px${'">' +
          '<div class="modal-header"><h1 class="modal-title">'}</h1></div>` +
          '<div class="modal-body-wrapper">' +
            '<div class="modal-body"></div>' +
          '</div>' +
        '</div>' +
      '</div>');

    if (this.settings.showCloseBtn) {
      const closeBtn = $(`
        <button type="button" class="btn-icon btn-close" title="${Locale.translate('Close')}" aria-hidden="true">
          ${$.createIcon('close')}
          <span class="audible">${Locale.translate('Close')}</span>
        </button>
      `);
      this.element.find('.modal-content').append(closeBtn);
      closeBtn.on(`click.${this.namespace}`, () => this.close()).tooltip();
    }

    if (this.settings.id) {
      this.element.attr('id', this.settings.id);
    }

    if ($(this.settings.content).is('.modal')) {
      this.element = $(this.settings.content);
      isAppended = this.element.parent().hasClass('modal-wrapper');
    } else if (this.settings.content && this.settings.content.length > 0) {
      if (this.settings.content instanceof jQuery && this.settings.content.parent().is('.modal-body')) {
        isAppended = true;
        this.element = this.settings.content.closest('.modal');
      } else {
        this.element.find('.modal-body').append(this.settings.content);
      }

      if (this.settings.content instanceof jQuery && !this.settings.beforeShow) {
        this.settings.content.removeClass('hidden is-hidden');
        this.settings.content.show();
      }
    }

    if (this.settings.beforeShow) {
      this.busyIndicator = $('<div class="overlay busy"></div>' +
        '<div class="busy-indicator-container blocked-ui" aria-live="polite" role="status">' +
          '<div class="busy-indicator active">' +
            '<div class="bar one"></div>' +
            '<div class="bar two"></div>' +
            '<div class="bar three"></div>' +
            '<div class="bar four"></div>' +
            '<div class="bar five"></div>' +
          '</div>' +
          '<span>Loading...</span>' +
        '</div>');
      $('body').append(this.busyIndicator);
    }

    if (!isAppended) {
      this.element.appendTo('body');
    }

    if (this.settings.cssClass) {
      this.element.addClass(this.settings.cssClass);
    }

    if (this.settings.title) {
      // Prevent Css on the title
      this.element.find('.modal-title')[0].innerHTML = xssUtils.stripTags(this.settings.title, '<div><span><a><small><img><svg><i><b><use><br><strong><em>');
    }

    if (!isAppended) {
      this.addButtons(this.settings.buttons);
    }

    utils.fixSVGIcons(this.element);
  }