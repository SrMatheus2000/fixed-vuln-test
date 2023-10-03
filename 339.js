function unique_name_174 (index = this.options.initialViewIndex) {
    index = Number(index) || 0;

    if (!this.isShown) {
      this.index = index;
      return this.show();
    }

    if (this.hiding || this.played || index < 0 || index >= this.length
      || (this.viewed && index === this.index)) {
      return this;
    }

    if (this.viewing) {
      this.viewing.abort();
    }

    const {
      element,
      options,
      title,
      canvas,
    } = this;
    const item = this.items[index];
    const img = item.querySelector('img');
    const url = escapeHTMLEntities(getData(img, 'originalUrl'));
    const alt = escapeHTMLEntities(img.getAttribute('alt'));
    const image = document.createElement('img');

    image.src = url;
    image.alt = alt;

    if (isFunction(options.view)) {
      addListener(element, EVENT_VIEW, options.view, {
        once: true,
      });
    }

    if (dispatchEvent(element, EVENT_VIEW, {
      originalImage: this.images[index],
      index,
      image,
    }) === false || !this.isShown || this.hiding || this.played) {
      return this;
    }

    this.image = image;
    removeClass(this.items[this.index], CLASS_ACTIVE);
    addClass(item, CLASS_ACTIVE);
    this.viewed = false;
    this.index = index;
    this.imageData = {};
    addClass(image, CLASS_INVISIBLE);

    if (options.loading) {
      addClass(canvas, CLASS_LOADING);
    }

    canvas.innerHTML = '';
    canvas.appendChild(image);

    // Center current item
    this.renderList();

    // Clear title
    title.innerHTML = '';

    // Generate title after viewed
    const onViewed = () => {
      const { imageData } = this;
      const render = Array.isArray(options.title) ? options.title[1] : options.title;

      title.innerHTML = escapeHTMLEntities(isFunction(render)
        ? render.call(this, image, imageData)
        : `${alt} (${imageData.naturalWidth} × ${imageData.naturalHeight})`);
    };
    let onLoad;

    addListener(element, EVENT_VIEWED, onViewed, {
      once: true,
    });

    this.viewing = {
      abort() {
        removeListener(element, EVENT_VIEWED, onViewed);

        if (image.complete) {
          if (this.imageRendering) {
            this.imageRendering.abort();
          } else if (this.imageInitializing) {
            this.imageInitializing.abort();
          }
        } else {
          // Cancel download to save bandwidth.
          image.src = '';
          removeListener(image, EVENT_LOAD, onLoad);

          if (this.timeout) {
            clearTimeout(this.timeout);
          }
        }
      },
    };

    if (image.complete) {
      this.load();
    } else {
      addListener(image, EVENT_LOAD, onLoad = this.load.bind(this), {
        once: true,
      });

      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      // Make the image visible if it fails to load within 1s
      this.timeout = setTimeout(() => {
        removeClass(image, CLASS_INVISIBLE);
        this.timeout = false;
      }, 1000);
    }

    return this;
  }