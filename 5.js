function unique_name_2 (value, type, options) {

    let result = value;
    switch (type) {
        case 'number':
            const num = Number(value);
            result = isNaN(num) ? undefined : num;
            break;
        case 'array':
            if (typeof value === 'string') {
                result = value ? value.split(options.splitToken) : [];
            }
            else {
                result = undefined;
            }

            break;
        case 'boolean':
            result = undefined;

            if (typeof value === 'string') {

                const string = value.toLowerCase();

                if (string === 'true') {

                    result = true;
                }
                else if (string === 'false') {

                    result = false;
                }
            }

            break;
        case 'object':
            try {
                result = Bourne.parse(value);
            }
            catch (e) {
                result = undefined;
            }

            break;
    }

    return result;
}