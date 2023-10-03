function unique_name_680 () {
      const contact = this.model.isIncoming() ? this.model.getContact() : null;
      const attachments = this.model.get('attachments');

      const errors = this.model.get('errors');
      const hasErrors = errors && errors.length > 0;
      const hasAttachments = attachments && attachments.length > 0;
      const hasBody = this.hasTextContents();

      this.$el.html(
        Mustache.render(
          _.result(this, 'template', ''),
          {
            message: this.model.get('body'),
            hasBody,
            timestamp: this.model.get('sent_at'),
            sender: (contact && contact.getTitle()) || '',
            avatar: contact && contact.getAvatar(),
            profileName: contact && contact.getProfileName(),
            innerBubbleClasses: this.isImageWithoutCaption() ? '' : 'with-tail',
            hoverIcon: !hasErrors,
            hasAttachments,
            reply: i18n('replyToMessage'),
          },
          this.render_partials()
        )
      );
      this.timeStampView.setElement(this.$('.timestamp'));
      this.timeStampView.update();

      this.renderControl();

      const body = this.$('.body');

      emoji_util.parse(body);

      if (body.length > 0) {
        const escapedBody = body.html();
        body.html(
          escapedBody
            .replace(/\n/g, '<br>')
            .replace(URL_REGEX, "$1<a href='$2' target='_blank'>$2</a>")
        );
      }

      this.renderSent();
      this.renderDelivered();
      this.renderRead();
      this.renderErrors();
      this.renderExpiring();
      this.renderQuote();

      // NOTE: We have to do this in the background (`then` instead of `await`)
      // as our code / Backbone seems to rely on `render` synchronously returning
      // `this` instead of `Promise MessageView` (this):
      // eslint-disable-next-line more/no-then
      this.loadAttachmentViews().then(views =>
        this.renderAttachmentViews(views)
      );

      return this;
    }