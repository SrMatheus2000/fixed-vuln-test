function unique_name_447(item) {
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
      }