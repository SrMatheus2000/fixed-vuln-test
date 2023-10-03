function fetchData(repo, done) {
    var github  = new Github({ token: store.get(TOKEN) })
      , api     = github.getRepo(repo.username, repo.reponame)
      , root    = []
      , folders = { '': root }

    api.getTree(encodeURIComponent(repo.branch) + '?recursive=true', function(err, tree) {
      if (err) return done(err)
      tree.forEach(function(item) {
        var path   = item.path
          , type   = item.type
          , index  = path.lastIndexOf('/')
          , name   = path.substring(index + 1)
          , folder = folders[path.substring(0, index)]
          , url    = '/' + repo.username + '/' + repo.reponame + '/' + type + '/' + repo.branch + '/' + path

        folder.push(item)
        item.text = sanitize(name)
        item.icon = type // use `type` as class name for tree node
        if (type === 'tree') {
          folders[item.path] = item.children = []
          item.a_attr = { href: '#' }
        }
        else if (type === 'blob') {
          item.a_attr = { href: url }
        }
        // TOOD: handle submodule
      })

      done(null, sort(root))

      function sort(folder) {
        folder.sort(function(a, b) {
          if (a.type === b.type) return a.text.localeCompare(b.text)
          return a.type === 'tree' ? -1 : 1
        })
        folder.forEach(function(item) {
          if (item.type === 'tree') sort(item.children)
        })
        return folder
      }
    })
  }