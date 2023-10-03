async function unique_name_290 (value, definition) {

    if (!value &&
        definition.encoding === 'form') {

        return {};
    }

    Hoek.assert(typeof value === 'string', 'Invalid string');

    // Encodings: 'base64json', 'base64', 'form', 'iron', 'none'

    if (definition.encoding === 'iron') {
        return await Iron.unseal(value, definition.password, definition.iron || Iron.defaults);
    }

    if (definition.encoding === 'base64json') {
        const decoded = (Buffer.from(value, 'base64')).toString('binary');
        try {
            return Bourne.parse(decoded);
        }
        catch (err) {
            throw Boom.badRequest('Invalid JSON payload');
        }
    }

    if (definition.encoding === 'base64') {
        return (Buffer.from(value, 'base64')).toString('binary');
    }

    // encoding: 'form'

    return Querystring.parse(value);
}