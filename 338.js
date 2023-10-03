(item, i) => {
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
    }