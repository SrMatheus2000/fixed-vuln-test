function unique_name_147 (options, payload, mime) {

    // Binary

    if (mime === 'application/octet-stream') {
        return payload.length ? payload : null;
    }

    // Text

    if (mime.match(/^text\/.+$/)) {
        return payload.toString('utf8');
    }

    // JSON

    if (/^application\/(?:.+\+)?json$/.test(mime)) {
        if (!payload.length) {
            return null;
        }

        try {
            return Bourne.parse(payload.toString('utf8'), { protoAction: options.protoAction });
        }
        catch (err) {
            const error = Boom.badRequest('Invalid request payload JSON format', err);
            error.raw = payload;
            throw error;
        }
    }

    // Form-encoded

    if (mime === 'application/x-www-form-urlencoded') {
        const parse = options.querystring || Querystring.parse;
        return payload.length ? parse(payload.toString('utf8')) : {};
    }

    const error = Boom.unsupportedMediaType();
    error.raw = payload;
    throw error;
}