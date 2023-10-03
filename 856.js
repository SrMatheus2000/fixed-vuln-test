function unique_name_475(text) {
      if (skipText) {
        return;
      }
      var lastFrame = stack[stack.length-1];
      var tag;

      if (lastFrame) {
        tag = lastFrame.tag;
        // If inner text was set by transform function then let's use it
        text = lastFrame.innerText !== undefined ? lastFrame.innerText : text;
      }

      if ((tag === 'script') || (tag === 'style')) {
        // htmlparser2 gives us these as-is. Escaping them ruins the content. Allowing
        // script tags is, by definition, game over for XSS protection, so if that's
        // your concern, don't allow them. The same is essentially true for style tags
        // which have their own collection of XSS vectors.
        result += text;
      } else {
        var escaped = escapeHtml(text);
        if (options.textFilter) {
          result += options.textFilter(escaped);
        } else {
          result += escaped;
        }
      }
      if (stack.length) {
           var frame = stack[stack.length - 1];
           frame.text += text;
      }
    }