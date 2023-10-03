function unique_name_613(repo) {
          repoUrl = repo;
          log('Cloning ' + urlSafe(repo,'[secure]') + ' into ' + options.clone);
          return git.clone(repo, options.clone, options.branch, options);
        }