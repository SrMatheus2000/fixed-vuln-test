function unique_name_146 (payload, mime, next) {

    // Binary

    if (mime === 'application/octet-stream') {
        return next(null, payload.length ? payload : null);
    }

    // Text

    if (mime.match(/^text\/.+$/)) {
        return next(null, payload.toString('utf8'));
    }

    // JSON

    if (/^application\/(?:.+\+)?json$/.test(mime)) {
        return internals.jsonParse(payload, next);                      // Isolate try...catch for V8 optimization
    }

    // Form-encoded

    if (mime === 'application/x-www-form-urlencoded') {
        const parse = this.settings.querystring || Querystring.parse;
        return next(null, payload.length ? parse(payload.toString('utf8')) : {});
    }

    return next(Boom.unsupportedMediaType());
}