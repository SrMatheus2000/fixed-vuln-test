function unique_name_292(tElement) {
        var startSym = $interpolate.startSymbol();
        var endSym = $interpolate.endSymbol();
        if (!(startSym === '{{' && endSym === '}}')) {
          var interpolatedHtml = tElement.text()
            .replace(/\{\{/g, startSym)
            .replace(/\}\}/g, endSym);
          tElement.text(interpolatedHtml);
        }
        return link;
      }