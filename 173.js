(value, pattern, valid, cb, options) => {
    /*
    * Already not valid
    * */
    if (!valid) return false;

    /*
    * When pattern(pattern) is primitive type
    */
    if (pattern !== Object(pattern)) {
        return (valid = cb(value, pattern, options));
    }

    /*
    * When pattern is not either an Array is not a primitive object
    */
    if (typeof pattern === 'function' && pattern !== Object && pattern !== Array) {
        return (valid = cb(value, pattern, options));
    }

    /*
    * Iterate through value
    * */
    for (const property in value) {
        if (Object.prototype.hasOwnProperty.call(value, String(property))) {
            const level = push(options, property, value.constructor);
            valid = (() => {
                /*
                * When missing pattern
                * */
                if (!Object.prototype.hasOwnProperty.call(pattern, String(property))) {
                    return (valid = cb(value[property], undefined, options));
                }

                if (value[property] === null || pattern[property] === null ||
                    typeof value[property] === 'undefined' || typeof pattern[property] === 'undefined') {
                    return (valid = cb(value[property], pattern[property], options));
                }

                /*
                * iterate if pattern is an Array
                * */
                if ((isArray(pattern[property])) && (pattern[property].length > 0)) {
                    if (!isArray(value[property])) {
                        return (valid = cb(value[property], pattern[property], options));
                    }
                    for (let i = 0; i < value[property].length; i++) {
                        const levelArray = push(options, i, Array);
                        valid = iterate(value[property][i], pattern[property][0], valid, cb, options);
                        pull(options, levelArray);
                        if (!valid) break;
                    }

                    return valid;
                }

                /*
                * iterate recursively when pattern and json are objects
                * and when pattern has other keys
                * */
                if ((typeof value[property] === 'object') &&
                    (typeof pattern[property] === 'object') &&
                    (pattern[property].constructor !== JpvObject) &&
                    (Object.keys(pattern[property]).length !== 0)) {
                    return (valid = iterate(value[property], pattern[property], valid, cb, options));
                }

                return (valid = cb(value[property], pattern[property], options));
            })();
            pull(options, level);
            if (!valid) return false;
        }
    }
    return valid;
}