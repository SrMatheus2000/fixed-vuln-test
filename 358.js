(dir) => {
            return (path.normalize(dir ? path.join(repoDir, dir) : repoDir));
        }