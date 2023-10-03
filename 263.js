async (ctx, next) => {
    const csp = [
      "default-src 'none'",
      "img-src 'self'",
      "form-action 'self'",
      "media-src 'self'",
      "style-src 'self'",
    ].join("; ");

    // Disallow scripts.
    ctx.set("Content-Security-Policy", csp);

    // Disallow <iframe> embeds from other domains.
    ctx.set("X-Frame-Options", "SAMEORIGIN");

    const isBlobPath = ctx.path.startsWith("/blob/");

    if (isBlobPath === false) {
      // Disallow browsers overwriting declared media types.
      //
      // This should only happen on non-blob URLs.
      // See: https://github.com/fraction/oasis/issues/138
      ctx.set("X-Content-Type-Options", "nosniff");
    }

    // Disallow sharing referrer with other domains.
    ctx.set("Referrer-Policy", "same-origin");

    // Disallow extra browser features except audio output.
    ctx.set("Feature-Policy", "speaker 'self'");

    const validHostsString = validHosts.join(" or ");

    ctx.assert(
      isValidRequest(ctx.request),
      400,
      `Request must be addressed to ${validHostsString} and non-GET requests must contain non-blob referer.`
    );

    await next();
  }