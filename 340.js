function unique_name_175 (fullscreen = false) {
    if (!this.isShown || this.played) {
      return this;
    }

    const { options, player } = this;
    const onLoad = this.loadImage.bind(this);
    const list = [];
    let total = 0;
    let index = 0;

    this.played = true;
    this.onLoadWhenPlay = onLoad;

    if (fullscreen) {
      this.requestFullscreen();
    }

    addClass(player, CLASS_SHOW);
    forEach(this.items, (item, i) => {
      const img = item.querySelector('img');
      const image = document.createElement('img');

      image.src = escapeHTMLEntities(getData(img, 'originalUrl'));
      image.alt = escapeHTMLEntities(img.getAttribute('alt'));
      total += 1;
      addClass(image, CLASS_FADE);
      toggleClass(image, CLASS_TRANSITION, options.transition);

      if (hasClass(item, CLASS_ACTIVE)) {
        addClass(image, CLASS_IN);
        index = i;
      }

      list.push(image);
      addListener(image, EVENT_LOAD, onLoad, {
        once: true,
      });
      player.appendChild(image);
    });

    if (isNumber(options.interval) && options.interval > 0) {
      const play = () => {
        this.playing = setTimeout(() => {
          removeClass(list[index], CLASS_IN);
          index += 1;
          index = index < total ? index : 0;
          addClass(list[index], CLASS_IN);
          play();
        }, options.interval);
      };

      if (total > 1) {
        play();
      }
    }

    return this;
  }