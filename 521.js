function unique_name_281 ($element, content) {
    if (typeof content === 'object' && (content.nodeType || content.jquery)) {
      // Content is a DOM node or a jQuery
      if (this.config.html) {
        if (!$(content).parent().is($element)) {
          $element.empty().append(content)
        }
      } else {
        $element.text($(content).text())
      }

      return
    }

    if (this.config.html) {
      if (this.config.sanitize) {
        content = sanitizeHtml(content, this.config.whiteList, this.config.sanitizeFn)
      }

      $element.html(content)
    } else {
      $element.text(content)
    }
  }