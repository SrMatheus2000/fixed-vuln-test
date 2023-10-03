function unique_name_213(entry) {

        if (!entry.id) {
          throw new Error('entry must have an id');
        }

        var html = entry.html;

        if (typeof html === 'string') {
          html = domify(html);
        }

        // unwrap jquery
        if (html.get && html.constructor.prototype.jquery) {
          html = html.get(0);
        }

        var entryNode = domify('<div class="bpp-properties-entry" data-entry="' + escapeHTML(entry.id) + '"></div>');

        forEach(entry.cssClasses || [], function(cssClass) {
          domClasses(entryNode).add(cssClass);
        });

        entryNode.appendChild(html);

        groupNode.appendChild(entryNode);

        // update conditionally visible elements
        self.updateState(entry, entryNode);
      }