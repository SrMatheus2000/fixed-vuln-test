(image, i) => {
      const src = escapeHTMLEntities(image.src);
      const alt = escapeHTMLEntities(image.alt || getImageNameFromURL(src));
      let { url } = options;

      if (isString(url)) {
        url = escapeHTMLEntities(image.getAttribute(url));
      } else if (isFunction(url)) {
        url = escapeHTMLEntities(url.call(this, image));
      }

      if (src || url) {
        items.push('<li>'
          + '<img'
            + ` src="${src || url}"`
            + ' role="button"'
            + ' data-viewer-action="view"'
            + ` data-index="${i}"`
            + ` data-original-url="${url || src}"`
            + ` alt="${alt}"`
          + '>'
        + '</li>');
      }
    }