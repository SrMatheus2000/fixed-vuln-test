function authenticateStrategy(req, options) {
  const self = this;
  var params = {};
  var optionsToValidate = {};
  var tenantIdOrName = options && options.tenantIdOrName;

  /* Some introduction to async.waterfall (from the following link):
   * http://stackoverflow.com/questions/28908180/what-is-a-simple-implementation-of-async-waterfall
   *
   *   Runs the tasks array of functions in series, each passing their results 
   * to the next in the array. However, if any of the tasks pass an error to 
   * their own callback, the next function is not executed, and the main callback
   * is immediately called with the error.
   *
   * Example:
   *
   * async.waterfall([
   *   function(callback) {
   *     callback(null, 'one', 'two');
   *   },
   *   function(arg1, arg2, callback) {
   *     // arg1 now equals 'one' and arg2 now equals 'two'
   *     callback(null, 'three');
   *   },
   *   function(arg1, callback) {
   *     // arg1 now equals 'three'
   *     callback(null, 'done');
   *   }
   * ], function (err, result) {
   *      // result now equals 'done'    
   * }); 
   */
  async.waterfall([

    // compute metadataUrl
    (next) => {
      params.metadataURL = aadutils.concatUrl(self._options.identityMetadata,
        [
          `${aadutils.getLibraryProductParameterName()}=${aadutils.getLibraryProduct()}`,
          `${aadutils.getLibraryVersionParameterName()}=${aadutils.getLibraryVersion()}`
        ]
      );

      // if we are not using the common endpoint, but we have tenantIdOrName, just ignore it
      if (!self._options._isCommonEndpoint && tenantIdOrName) {
        if (self._options.loggingNoPII)
          log.info('identityMetadata is tenant-specific, so we ignore the provided tenantIdOrName');
        else
          log.info(`identityMetadata is tenant-specific, so we ignore the tenantIdOrName '${tenantIdOrName}'`);
        tenantIdOrName = null;
      }

      // if we are using common endpoint and we are given the tenantIdOrName, let's replace it
      if (self._options._isCommonEndpoint && tenantIdOrName) {
        params.metadataURL = params.metadataURL.replace('/common/', `/${tenantIdOrName}/`);
        if (self._options.loggingNoPII)
          log.info(`We are replacing 'common' with the provided tenantIdOrName`);
        else
          log.info(`we are replacing 'common' with the tenantIdOrName ${tenantIdOrName}`);
      }

      // if we are using the common endpoint and we want to validate issuer, then user has to 
      // provide issuer in config, or provide tenant id or name using tenantIdOrName option in
      // passport.authenticate. Otherwise we won't know the issuer.
      if (self._options._isCommonEndpoint && self._options.validateIssuer &&
        (!self._options.issuer && !tenantIdOrName))
        return next(new Error('In passport.authenticate: issuer or tenantIdOrName must be provided in order to validate issuer on common endpoint'));

      // for B2C, if we are using common endpoint, we must have tenantIdOrName provided
      if (self._options.isB2C && self._options._isCommonEndpoint && !tenantIdOrName)
        return next(new Error('In passport.authenticate: we are using common endpoint for B2C but tenantIdOrName is not provided'));

      if (self._options.isB2C)
        params.metadataURL = aadutils.concatUrl(params.metadataURL, `p=${self._options.policyName}`);

      params.cacheKey = params.metadataURL;

      if (!self._options.loggingNoPII)
        log.info(`In Strategy.prototype.authenticate: ${JSON.stringify(params)}`);

      return next(null, params);
    },
    
    // load metatadata
    (params, next) => {
      return self.loadMetadata(params, next);
    },

    // configure using metadata
    (metadata, next) => {
      params.metadata = metadata;
      if (self._options.loggingNoPII)
        log.info('In Strategy.prototype.authenticate: received metadata');
      else
        log.info(`In Strategy.prototype.authenticate: received metadata: ${JSON.stringify(metadata)}`);

      // set up issuer
      if (self._options.validateIssuer && !self._options.issuer)
        optionsToValidate.issuer = metadata.oidc.issuer;
      else
        optionsToValidate.issuer = self._options.issuer;

      // set up algorithm
      optionsToValidate.algorithms = metadata.oidc.algorithms;

      // set up audience, validateIssuer, allowMultiAudiencesInToken
      optionsToValidate.audience = self._options.audience;
      optionsToValidate.validateIssuer = self._options.validateIssuer;
      optionsToValidate.allowMultiAudiencesInToken = self._options.allowMultiAudiencesInToken;
      optionsToValidate.ignoreExpiration = self._options.ignoreExpiration;

      // clock skew
      optionsToValidate.clockSkew = self._options.clockSkew;

      // set up scope
      if (self._options.scope)
        optionsToValidate.scope = self._options.scope;

      // Beaer token is considered as an access_token.  
      optionsToValidate.isAccessToken = true;

      if (self._options.loggingNoPII)
        log.info(`In Strategy.prototype.authenticate: we will validate the options`);
      else
        log.info(`In Strategy.prototype.authenticate: we will validate the following options: ${optionsToValidate}`);

      return next();
    }, 

    // extract the access token from the request, after getting the token, it 
    // will call `jwtVerify` to verify the token. If token is verified, `jwtVerify`
    // will provide the token payload to self._verify function. self._verify is
    // provided by the developer, it's up to the developer to decide if the token
    // payload is considered authenticated. If authenticated, self._verify will
    // provide `user` object (developer's decision of its content) to `verified` 
    // function here, and the `verified` function does the final work of stuffing
    // the `user` obejct into req.user, so the following middleware can use it.
    // This is basically how bearerStrategy works.
    (next) => {
      var token;

      // token could be in header or body. query is not supported.

      if (req.query && req.query.access_token)
        return self.failWithLog('In Strategy.prototype.authenticate: access_token should be passed in request header or body. query is unsupported');

      if (req.headers && req.headers.authorization) {
        var auth_components = req.headers.authorization.split(' ');
        if (auth_components.length == 2 &&auth_components[0].toLowerCase() === 'bearer') {
            token = auth_components[1];
            if (token !== '') {
              if (self._options.loggingNoPII)
                log.info('In Strategy.prototype.authenticate: access_token is received from request header');
              else
                log.info(`In Strategy.prototype.authenticate: received access_token from request header: ${token}`);
            }              
            else
              return self.failWithLog('In Strategy.prototype.authenticate: missing access_token in the header');
        }
      }

      if (req.body && req.body.access_token) {
        if (token) 
          return self.failWithLog('In Strategy.prototype.authenticate: access_token cannot be passed in both request header and body');
        token = req.body.access_token;
        if (token) {
          if (self._options.loggingNoPII)
            log.info('In Strategy.prototype.authenticate: access_token is received from request body');
          else
            log.info(`In Strategy.prototype.authenticate: received access_token from request body: ${token}`);
        }          
      }

      if (!token)
        return self.failWithLog('token is not found'); 

      function verified(err, user, info) {
        if (err)
          return self.error(err);

        if (!user) {
          var err_message = 'error: invalid_token';
          if (info && typeof info == 'string')
            err_message += ', error description: ' + info;
          else if (info)
            err_message += ', error description: ' + JSON.stringify(info);

          if (self._options.loggingNoPII)
            return self.failWithLog('error: invalid_token');
          else
            return self.failWithLog(err_message);
        }

        return self.success(user, info);
      }

      return self.jwtVerify(req, token, params.metadata, optionsToValidate, verified);
    }],

    (waterfallError) => { // This function gets called after the three tasks have called their 'task callbacks'
      if (waterfallError) {
        return self.failWithLog(waterfallError);
      }
      return true;
    }
  );
}