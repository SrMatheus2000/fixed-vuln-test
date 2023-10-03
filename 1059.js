function unique_name_625 (batchRequest, resultsData, pos, parts, callback) {

    var path = '';
    var error = null;

    for (var i = 0, il = parts.length; i < il; ++i) {
        path += '/';

        if (parts[i].type === 'ref') {
            var ref = resultsData.resultsMap[parts[i].index];

            if (ref) {
                var value = ref[parts[i].value]||null;

                if (value) {

                    if (value.match && value.match(/^[\w:]+$/)) {
                        path += value;
                    }
                    else {
                        error = new Error('Reference value includes illegal characters');
                        break;
                    }
                }
                else {
                    error = error || new Error('Reference not found');
                    break;
                }
            }
            else {
                error = new Error('Missing reference response');
                break;
            }
        }
        else {
            path += parts[i].value;
        }
    }

    if (error === null) {

        // Make request
        batchRequest.payload.requests[pos].path = path;
        internals.dispatch(batchRequest, batchRequest.payload.requests[pos], function (data) {

            // If redirection
            if (('' + data.statusCode).indexOf('3')  === 0) {
                batchRequest.payload.requests[pos].path = data.headers.location;
                internals.dispatch(batchRequest, batchRequest.payload.requests[pos], function (data) {
                    var result = data.result;

                    resultsData.results[pos] = result;
                    resultsData.resultsMap[pos] = result;
                    callback(null, result);
                });
                return;
            }

            var result = data.result;
            resultsData.results[pos] = result;
            resultsData.resultsMap[pos] = result;
            callback(null, result);
        });
    }
    else {
        resultsData.results[pos] = error;
        return callback(error);
    }
}