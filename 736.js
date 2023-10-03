res => {
        const branch = res.data.head.ref;
        execFileSync("git", ["fetch", "origin", `pull/${id}/head:${branch}`]);
        execFileSync("git", ["checkout", branch]);
      }