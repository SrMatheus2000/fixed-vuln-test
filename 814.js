function unique_name_446 (repo) {
    const adapter = this.adapter

    this.$view.find('.octotree_view_header')
      .html(
        '<div class="octotree_header_repo">' +
           '<a href="/' + repo.username + '">' + repo.username +'</a>'  +
           ' / ' +
           '<a data-pjax href="/' + repo.username + '/' + repo.reponame + '">' + repo.reponame +'</a>' +
         '</div>' +
         '<div class="octotree_header_branch">' +
           this._deXss(repo.branch) +
         '</div>'
      )
      .on('click', 'a[data-pjax]', function (event) {
        event.preventDefault()
        adapter.selectFile($(this).attr('href') /* a.href always return absolute URL, don't want that */)
      })
  }