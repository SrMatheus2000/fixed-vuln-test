function unique_name_553() {
  "use strict"

  // detect ie9 and lower
  // https://gist.github.com/padolsey/527683#comment-786682
  var ie = (function(){
    for( var v = 3,
             el = document.createElement('b'),
             all = el.all || [];
         el.innerHTML = '<!--[if gt IE ' + (++v) + ']><i><![endif]-->',
         all[0];
       ){}
    return v > 4 ? v : document.documentMode;
  }());

  var Clusterize = function(data) {
    if( ! (this instanceof Clusterize))
      return new Clusterize(data);
    var self = this;

    var defaults = {
      item_height: 0,
      block_height: 0,
      rows_in_block: 50,
      rows_in_cluster: 0,
      cluster_height: 0,
      blocks_in_cluster: 4,
      tag: null,
      show_no_data_row: true,
      no_data_class: 'clusterize-no-data',
      no_data_text: 'No data',
      keep_parity: true,
      verify_change: false
    }

    // public parameters
    self.options = {};
    ['rows_in_block', 'blocks_in_cluster', 'verify_change', 'show_no_data_row', 'no_data_class', 'no_data_text', 'keep_parity', 'tag'].forEach(function(name) {
      self.options[name] = typeof data[name] != 'undefined' && data[name] != null
        ? data[name]
        : defaults[name];
    });

    self.scrollElem = data.scrollId
      ? document.getElementById(data.scrollId)
      : data.scrollElem;
    self.contentElem = data.contentId
      ? document.getElementById(data.contentId)
      : data.contentElem;

    if( ! self.contentElem)
      throw new Error("Error! Could not find content element");
    if( ! self.scrollElem)
      throw new Error("Error! Could not find scroll element");

    // private parameters
    var rows = data.rows || [],
      cache = {data: ''},
      scrollTop = self.scrollElem.scrollTop;

    // get row height
    self.calcClusterHeight(rows);

    // append initial data
    self.insertToDOM(rows, cache);

    // restore the scroll position
    self.scrollElem.scrollTop = scrollTop;

    // adding scroll handler
    var last_cluster = false,
    scrollEv = function () {
      if (last_cluster != (last_cluster = self.getClusterNum()))
        self.insertToDOM(rows, cache);
    }
    self.scrollElem.addEventListener('scroll', scrollEv);

    // public methods
    self.destroy = function(clean) {
      self.scrollElem.removeEventListener('scroll', scrollEv);
      self.html(clean ? self.generateEmptyRow().join('') : rows.join(''));
    }
    self.update = function(new_rows) {
      rows = self.isArray(new_rows)
        ? new_rows
        : [];
      var scrollTop = self.scrollElem.scrollTop;
      self.insertToDOM(rows, cache);
      self.scrollElem.scrollTop = scrollTop;
    }
    self.append = function(_new_rows) {
      var new_rows = self.isArray(_new_rows)
        ? _new_rows
        : [];
      if( ! new_rows.length) return;
      rows = rows.concat(new_rows);
      self.insertToDOM(rows, cache);
    }
    self.clear = function() {
      self.update([]);
    }
    self.getRowsAmount = function() {
      return rows.length;
    }
  }
  Clusterize.prototype = {
    constructor: Clusterize,
    // get tag name, tag height, calc cluster height
    calcClusterHeight: function(rows) {
      var opts = this.options;
      if( ! opts.item_height || ! opts.tag) {
        if( ! rows.length) return;
        this.html(rows[0] + rows[0] + rows[0]);
        var node = this.contentElem.children[1];
        if( ! opts.tag) opts.tag = node.tagName.toLowerCase();
        opts.item_height = node.offsetHeight;
      }
      opts.block_height = opts.item_height * opts.rows_in_block;
      opts.rows_in_cluster = opts.blocks_in_cluster * opts.rows_in_block;
      opts.cluster_height = opts.blocks_in_cluster * opts.block_height;
    },
    // get current cluster number
    getClusterNum: function () {
      var opts = this.options;
      return Math.floor(this.scrollElem.scrollTop / (opts.cluster_height - opts.block_height));
    },
    // generate empty row if no data provided
    generateEmptyRow: function() {
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
    },
    // generate cluster for current scroll position
    generate: function (rows, cluster_num) {
      var opts = this.options,
        rows_len = rows.length;
      if( ! rows_len) {
        return this.generateEmptyRow();
      }
      if (rows_len < opts.rows_in_block) {
        return rows;
      }
      if( ! opts.cluster_height) {
        this.calcClusterHeight(rows);
      }
      var items_start = cluster_num * opts.rows_in_cluster - opts.rows_in_block * cluster_num,
        items_start = items_start > 0 ? items_start : 0,
        items_end = items_start + opts.rows_in_cluster,
        top_margin = items_start * opts.item_height,
        bottom_margin = (rows_len - items_end) * opts.item_height,
        to_push = document.createElement(opts.tag),
        this_cluster_items = [];
      if(top_margin > 0) {
        to_push.className = 'clusterize-extra-row';
        if (opts.keep_parity) {
          to_push.classList.add('clusterize-keep-parity');
          this_cluster_items.push(to_push.outerHTML);
          to_push.classList.remove('clusterize-keep-parity');
        }
        while (to_push.lastChild) {
          to_push.removeChild(to_push.lastChild);
        }
        to_push.classList.add('clusterize-top-space');
        to_push.style.height = top_margin + 'px';
        this_cluster_items.push(to_push.outerHTML);
      }
      for (var i = items_start; i < items_end; i++) {
        rows[i] && this_cluster_items.push(rows[i]);
      }
      if (bottom_margin > 0) {
        while (to_push.lastChild) {
          to_push.removeChild(to_push.lastChild);
        }
        to_push.className = ['clusterize-extra-row', 'clusterize-bottom-space'].join(' ');
        to_push.style.height = bottom_margin + 'px';
        this_cluster_items.push(to_push.outerHTML);
      }
      // console.log(this_cluster_items);
      return this_cluster_items;
    },
    // if necessary verify data changed and insert to DOM
    insertToDOM: function(rows, cache) {
      var data = this.generate(rows, this.getClusterNum()).join('');
      if( ! this.options.verify_change || this.options.verify_change && this.dataChanged(data, cache)) {
        this.html(data);
      }
    },
    // unfortunately ie <= 9 does not allow to use innerHTML for table elements, so make a workaround
    html: function(data) {
      var contentElem = this.contentElem;
      if(ie && ie <= 9 && this.options.tag == 'tr') {
        var div = document.createElement('div'), last;
        div.appendChild(document.createElement('table'));
        div.firstChild.firstChild.appendChild(data);
        while((last = contentElem.lastChild)) {
          contentElem.removeChild(last)
        }
        var rows = Array.prototype.slice.call(div.firstChild.firstChild.childNodes);
        while (rows.length) {
          contentElem.appendChild(rows.shift());
        }
      } else {
        contentElem.innerHTML = data;
      }
    },
    dataChanged: function(data, cache) {
      var current_data = JSON.stringify(data),
        changed = current_data !== cache.data;
      return changed && (cache.data = current_data);
    },
    isArray: function(arr) {
      return Object.prototype.toString.call(arr) === '[object Array]';
    }
  }
  return Clusterize;
}