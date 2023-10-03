function fetchContentType () {
    const defaultValue = parseHeaderValue('text/plain')
    this.contentType = pathOr(defaultValue, ['headers', 'content-type', '0'])(this)
    this.contentType.value = (this.contentType.value || '').toLowerCase().trim()
    this.contentType.type = (this.contentType.value.split('/').shift() || 'text')

    if (this.contentType.params && this.contentType.params.charset && !this.charset) {
      this.charset = this.contentType.params.charset
    }

    if (this.contentType.type === 'multipart' && this.contentType.params.boundary) {
      this.childNodes = []
      this._isMultipart = (this.contentType.value.split('/').pop() || 'mixed')
      this._multipartBoundary = this.contentType.params.boundary
    }

    /**
     * For attachment (inline/regular) if charset is not defined and attachment is non-text/*,
     * then default charset to binary.
     * Refer to issue: https://github.com/emailjs/emailjs-mime-parser/issues/18
     */
    const defaultContentDispositionValue = parseHeaderValue('')
    const contentDisposition = pathOr(defaultContentDispositionValue, ['headers', 'content-disposition', '0'])(this)
    const isAttachment = (contentDisposition.value || '').toLowerCase().trim() === 'attachment'
    const isInlineAttachment = (contentDisposition.value || '').toLowerCase().trim() === 'inline'
    if ((isAttachment || isInlineAttachment) && this.contentType.type !== 'text' && !this.charset) {
      this.charset = 'binary'
    }

    if (this.contentType.value === 'message/rfc822' && !isAttachment) {
      /**
       * Parse message/rfc822 only if the mime part is not marked with content-disposition: attachment,
       * otherwise treat it like a regular attachment
       */
      this._currentChild = new MimeNode(this.nodeCounter)
      this.childNodes = [this._currentChild]
      this._isRfc822 = true
    }
  }