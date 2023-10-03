(req) => {
      // check the request method
      if (req.method.toLowerCase() !== method && method !== 'any') {
        return false;
      }

      // Do not allow directory traversal
      if (path.normalize(req.url) !== req.url) {
        return false;
      }

      // Discard any fragments before further processing
      const mainURI = req.url.split('#')[0];

      // query params might contain additional "?"s, only split on the 1st one
      const parts = mainURI.split('?');
      let [url, querystring] = [parts[0], parts.slice(1).join('?')];
      const res = regexp.exec(url);
      if (!res) {
        // no url match
        return false;
      }

      // reconstruct the url from the user config
      for (let i = 1; i < res.length; i++) {
        const val = fromConfig[keys[i - 1].name];
        if (val) {
          url = url.replace(res[i], val);
        }
      }

      // if validity filters are present, at least one must be satisfied
      if (bodyFilters.length || bodyRegexFilters.length ||
          queryFilters.length) {
        let isValid;

        let parsedBody;
        if (bodyFilters.length) {
          parsedBody = tryJSONParse(req.body);

          // validate against the body
          isValid = bodyFilters.some(({ path, value }) => {
            return undefsafe(parsedBody, path, value);
          });
        }

        if (!isValid && bodyRegexFilters.length) {
          parsedBody = parsedBody || tryJSONParse(req.body);

          // validate against the body by regex
          isValid = bodyRegexFilters.some(({ path, regex }) => {
            try {
              const re = new RegExp(regex);
              return re.test(undefsafe(parsedBody, path));
            } catch (error) {
              logger.error({error, path, regex},
                'failed to test regex rule');
              return false;
            }
          });
        }

        // no need to check query filters if the request is already valid
        if (!isValid && queryFilters.length) {
          const parsedQuerystring = qs.parse(querystring);

          // validate against the querystring
          isValid = queryFilters.some(({ queryParam, values }) => {
            return values.some(value =>
              minimatch(parsedQuerystring[queryParam] || '', value)
            );
          });
        }

        if (!isValid) {
          return false;
        }
      }

      logger.debug({ path: entryPath, origin, url, querystring }, 'rule matched');

      querystring = (querystring) ? `?${querystring}` : '';
      return {
        url: origin + url + querystring,
        auth: entry.auth && authHeader(entry.auth),
        stream
      };
    }