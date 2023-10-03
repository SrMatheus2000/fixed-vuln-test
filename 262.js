(err, ctx) => {
    // Output full error objects
    console.error(err);

    // Avoid printing errors for invalid requests.
    if (isValidRequest(ctx.request)) {
      err.message = err.stack;
      err.expose = true;
    }

    return null;
  }