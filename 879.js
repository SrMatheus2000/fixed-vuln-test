function unique_name_494 (container, $image) {
      var caption = $image.attr('data-caption');

      if (caption) {
      	var containerPlain = container.get(0);
      	containerPlain.innerHTML = caption;
        container.show();
      } else {
        container
          .text('')
          .hide();
      }
      return this;
    }