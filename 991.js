function unique_name_573 (result, headers, callback) {

    // Check content type

    var contentType = (headers && headers['content-type']) || 'application/json';           //  Defaults to 'application/json'
    var mime = contentType.split(';')[0].trim().toLowerCase();

    // Text

    if (mime.match(/^text\/.+$/)) {
        return callback(result);
    }

    // JSON

    if (mime === 'application/json') {
        var obj = null;
        var error = null;

        try {
            obj = JSON.parse(result);
        }
        catch (exp) {
            error = Boom.badRequest('Invalid request payload format');
        }

        return callback(error, obj);
    }

    // Form-encoded

    if (mime === 'application/x-www-form-urlencoded') {
        return callback(null, Querystring.parse(result));
    }

    // Multipart

    if (mime === 'multipart/form-data') {

        var data = {};
        var form = new Formidable.IncomingForm();

        var processData = function (name, val) {

            if (data[name]) {
                data[name] = [data[name], val];
            }
            else {
                data[name] = val;
            }
        };

        form.on('field', processData);
        form.on('file', processData);

        form.once('error', function () {

            form.removeAllListeners('end');
            return callback(Boom.badRequest('Invalid request multipart payload format'));
        });

        form.once('end', function () {

            form.removeAllListeners('error');
            return callback(null, data);
        });

        form.writeHeaders(headers);
        form.write(new Buffer(result));
        return;
    }

    return callback(Boom.badRequest('Unsupported content-type'));
}