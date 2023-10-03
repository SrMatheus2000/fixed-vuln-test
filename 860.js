function unique_name_478 (request) {

    const header = request.headers['accept-encoding'];
    const accept = Accept.encoding(header, this.encodings);
    if (accept instanceof Error) {
        request.log(['accept-encoding', 'error'], { header, error: accept });
        return 'identity';
    }

    return accept;
}