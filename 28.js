function renderProp(input) {
      // Images inline
      if (
        typeof input === 'string'
        && (
          input.substr(0, 22) === 'data:image/png;base64,'
          || input.substr(0, 22) === 'data:image/gif;base64,'
          || input.substr(0, 22) === 'data:image/jpg;base64,'
          || input.substr(0, 23) === 'data:image/jpeg;base64,'
        )
      )  {
        return `<img src="${escapeHtml(input)}" style="max-height:100%; max-width:100%; "/>`;
      }

      // Audio inline
      if (
        typeof input === 'string'
        && (
          input.substr(0, 22) === 'data:audio/ogg;base64,'
          || input.substr(0, 22) === 'data:audio/wav;base64,'
          || input.substr(0, 22) === 'data:audio/mp3;base64,'
        )
      )  {
        return `<audio controls style="width:45px;" src="${escapeHtml(input)}">Your browser does not support the audio element.</audio>`;
      }

      // Video inline
      if (
        typeof input === 'string'
        && (
          input.substr(0, 23) === 'data:video/webm;base64,'
          || input.substr(0, 22) === 'data:video/mp4;base64,'
          ||  input.substr(0, 22) === 'data:video/ogv;base64,'
        )
      )  {
        const videoFormat = input.match(/^data:(.*);base64/)[1];
        return `<video controls><source type="${escapeHtml(videoFormat)}" src="${escapeHtml(input)}"/>
          + 'Your browser does not support the video element.</video>`;
      }
      if (typeof input === 'object' && (input.toString() === '[object Object]' || input.toString().substr(0, 7) === '[object')) {
        return renderjson(input);
      }

      // treat unknown data as escaped string
      return escapeHtml(input.toString());
    }