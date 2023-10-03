(state, silent) => {
    let token;
    let match;

    if (
      // Reject if the token does not start with @[
      state.src.charCodeAt(state.pos) !== 0x40 ||
      state.src.charCodeAt(state.pos + 1) !== 0x5b ||
      // Don’t run any pairs in validation mode
      silent
    ) {
      return false;
    }

    // Detect TOC markdown
    match = TOC_RE.exec(state.src);
    match = !match ? [] : match.filter(m => m);
    if (match.length < 1) {
      return false;
    }

    // Build content
    token = state.push("toc_open", "toc", 1);
    token.markup = TOC;
    token = state.push("toc_body", "", 0);
    token = state.push("toc_close", "toc", -1);

    // Update pos so the parser can continue
    state.pos = state.pos + 6;

    return true;
  }