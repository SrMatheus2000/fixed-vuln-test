function fetch(id) {
    return this.github.pullRequests
      .get({
        owner: this.owner,
        repo: this.repo,
        number: id
      })
      .then(res => {
        const branch = res.data.head.ref;
        execFileSync("git", ["fetch", "origin", `pull/${id}/head:${branch}`]);
        execFileSync("git", ["checkout", branch]);
      })
      .catch(err => {
        console.log("Error: Could not find the specified pull request.");
      });
  }