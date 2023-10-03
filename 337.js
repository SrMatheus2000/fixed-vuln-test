() => {
                /*
                * When missing pattern
                * */
                if (!pattern.hasOwnProperty(property)) {
                    return (valid = cb(value[property], undefined, options));
                }

                if (value[property] === null || pattern[property] === null ||
                    typeof value[property] === 'undefined' || typeof pattern[property] === 'undefined') {
                    return (valid = cb(value[property], pattern[property], options));
                }

                /*
                * iterate if pattern is an Array
                * */
                if ((pattern[property].constructor === Array) && (pattern[property].length > 0)) {
                    if (value[property].constructor !== Array) {
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
                    (Object.keys(pattern[property]).length !== 0)) {
                    return (valid = iterate(value[property], pattern[property], valid, cb, options));
                }

                return (valid = cb(value[property], pattern[property], options));
            }