function parse(done) {
    const {
      Category, ParseResult, SourceMap,
    } = this.minim.elements;
    const swaggerParser = new SwaggerParser();

    this.result = new ParseResult();

    // First, we load the YAML if it is a string, and handle any errors.
    let loaded;
    try {
      loaded = _.isString(this.source) ? yaml.safeLoad(this.source) : this.source;
    } catch (err) {
      this.createAnnotation(annotations.CANNOT_PARSE, null,
        (err.reason || 'Problem loading the input'));

      if (err.mark) {
        this.result.first().attributes.set('sourceMap', [
          new SourceMap([[err.mark.position, 1]]),
        ]);
      }

      return done(new Error(err.message), this.result);
    }

    // Some sane defaults since these are sometimes left out completely
    if (loaded.info === undefined) {
      loaded.info = {};
    }

    if (loaded.paths === undefined) {
      loaded.paths = {};
    }

    // Next, we dereference and validate the loaded Swagger object. Any schema
    // violations get converted into annotations with source maps.
    const swaggerOptions = {
      '$refs': {
        external: false,
      },
    };
    swaggerParser.validate(loaded, swaggerOptions, (err) => {
      const swagger = swaggerParser.api;
      this.swagger = swaggerParser.api;

      if (err) {
        if (this.swagger === undefined) {
          return done(err, this.result);
        }

        // Non-fatal errors, so let us try and create annotations for them and
        // continue with the parsing as best we can.
        if (err.details) {
          const queue = [err.details];
          while (queue.length) {
            for (const item of queue[0]) {
              this.createAnnotation(annotations.VALIDATION_ERROR, item.path,
                item.message);

              if (item.inner) {
                // TODO: I am honestly not sure what the correct behavior is
                // here. Some items will have within them a tree of other items,
                // some of which might contain more info (but it's unclear).
                // Do we treat them as their own error or do something else?
                queue.push(item.inner);
              }
            }
            queue.shift();
          }

          return done(new Error(err.message), this.result);
        }

        // Maybe there is some information in the error itself? Let's check
        // whether it is a messed up reference!
        let location = null;
        const matches = err.message.match(/\$ref pointer "(.*?)"/);

        if (matches) {
          location = [this.source.indexOf(matches[1]), matches[1].length];
        }

        const annotation = this.createAnnotation(annotations.VALIDATION_ERROR,
            null, err.message);

        if (location !== null) {
          annotation.attributes.set('sourceMap', [
            new SourceMap([location]),
          ]);
        }

        return done(new Error(err.message), this.result);
      }

      try {
        // Root API Element
        this.api = new Category();
        this.api.classes.push('api');
        this.result.push(this.api);

        // By default there are no groups, just the root API element
        this.group = this.api;

        this.handleSwaggerInfo();
        this.handleSwaggerHost();
        this.handleSwaggerAuth();

        if (swagger.externalDocs) {
          this.createAnnotation(annotations.DATA_LOST, ['externalDocs'],
            'External documentation is not yet supported');
        }

        const complete = () => {
          this.handleSwaggerVendorExtensions(this.api, swagger.paths);
          return done(null, this.result);
        };

        // Swagger has a paths object to loop through that describes resources
        // We will run each path on it's own tick since it may take some time
        // and we want to ensure that other events in the event queue are not
        // held up.
        const paths = _.omitBy(swagger.paths, isExtension);
        let pendingPaths = Object.keys(paths).length;

        if (pendingPaths === 0) {
          // If there are no paths, let's go ahead and call the callback.
          return complete();
        }

        _.forEach(paths, (pathValue, href) => {
          nextTick(() => {
            this.handleSwaggerPath(pathValue, href);

            if (--pendingPaths === 0) {
              // Last path, let's call the completion callback.
              complete();
            }
          });
        });
      } catch (exception) {
        this.createAnnotation(annotations.UNCAUGHT_ERROR, null,
          ('There was a problem converting the Swagger document'));

        return done(exception, this.result);
      }
    });
  }