function jsonpPlugin (data) {
    var query = data.req.query,
        name = query.callback || (query.callback_prefix + '_' + query.load);

    data.res.set({
        'Content-Type': 'application/javascript; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'attachment; filename=json.txt'
    });

    name = name.replace(/[\\'"]/g, "\\$&");

    return wrapper({
        header: 'window[\'' + name + '\'](',
        footer: ');'
    });
}