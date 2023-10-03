function constructor(repoDir, options={}) {
    super();

    if(typeof repoDir === 'function') {
        this.dirMap = repoDir;
    } else {
        this.dirMap = (dir) => {
            return (path.normalize(dir ? path.join(repoDir, dir) : repoDir));
        };
    }

    this.authenticate = options.authenticate;
    this.autoCreate = options.autoCreate === false ? false : true;
    this.checkout = options.checkout;
  }