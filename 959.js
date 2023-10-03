function unique_name_550() {
      var opts = this.options;
      if( ! opts.tag || ! opts.show_no_data_row) return [];
      var empty_row = document.createElement(opts.tag);
      var string_no_data = document.createTextNode(opts.no_data_text);
      empty_row.classList.add(opts.no_data_class);
      switch(opts.tag) {
        case 'tr':
          var row_content = document.createElement('td');
          row_content.appendChild(string_no_data);
          empty_row.appendChild(row_content);
          break;
        default:
          empty_row.appendChild(document.createTextNode(string_no_data))
      }
      return [empty_row.outerHTML];
    }