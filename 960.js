function unique_name_551 (rows, cluster_num) {
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
    }