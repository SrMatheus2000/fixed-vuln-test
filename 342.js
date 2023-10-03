function unique_name_176 () {
    const { element, options, list } = this;
    const items = [];

    forEach(this.images, (image, i) => {
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
    });

    list.innerHTML = items.join('');
    this.items = list.getElementsByTagName('li');
    forEach(this.items, (item) => {
      const image = item.firstElementChild;

      setData(image, 'filled', true);

      if (options.loading) {
        addClass(item, CLASS_LOADING);
      }

      addListener(image, EVENT_LOAD, (event) => {
        if (options.loading) {
          removeClass(item, CLASS_LOADING);
        }

        this.loadImage(event);
      }, {
        once: true,
      });
    });

    if (options.transition) {
      addListener(element, EVENT_VIEWED, () => {
        addClass(list, CLASS_TRANSITION);
      }, {
        once: true,
      });
    }
  }