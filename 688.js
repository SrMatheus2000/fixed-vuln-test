function unique_name_374() {
    // We need to call the base class's setup method
    User.base.setup.call(this);
    var UserModel = this;

    // max ttl
    this.settings.maxTTL = this.settings.maxTTL || DEFAULT_MAX_TTL;
    this.settings.ttl = this.settings.ttl || DEFAULT_TTL;

    UserModel.setter.email = function(value) {
      if (!UserModel.settings.caseSensitiveEmail) {
        this.$email = value.toLowerCase();
      } else {
        this.$email = value;
      }
    };

    UserModel.setter.password = function(plain) {
      if (typeof plain !== 'string') {
        return;
      }
      if (plain.indexOf('$2a$') === 0 && plain.length === 60) {
        // The password is already hashed. It can be the case
        // when the instance is loaded from DB
        this.$password = plain;
      } else {
        this.$password = this.constructor.hashPassword(plain);
      }
    };

    // Make sure emailVerified is not set by creation
    UserModel.beforeRemote('create', function(ctx, user, next) {
      var body = ctx.req.body;
      if (body && body.emailVerified) {
        body.emailVerified = false;
      }
      next();
    });

    UserModel.remoteMethod(
      'login',
      {
        description: 'Login a user with username/email and password.',
        accepts: [
          {arg: 'credentials', type: 'object', required: true, http: {source: 'body'}},
          {arg: 'include', type: ['string'], http: {source: 'query'},
            description: 'Related objects to include in the response. ' +
            'See the description of return value for more details.'},
        ],
        returns: {
          arg: 'accessToken', type: 'object', root: true,
          description:
            g.f('The response body contains properties of the {{AccessToken}} created on login.\n' +
            'Depending on the value of `include` parameter, the body may contain ' +
            'additional properties:\n\n' +
            '  - `user` - `U+007BUserU+007D` - Data of the currently logged in user. ' +
            '{{(`include=user`)}}\n\n'),
        },
        http: {verb: 'post'},
      }
    );

    UserModel.remoteMethod(
      'logout',
      {
        description: 'Logout a user with access token.',
        accepts: [
          {arg: 'access_token', type: 'string', http: function(ctx) {
            var req = ctx && ctx.req;
            var accessToken = req && req.accessToken;
            var tokenID = accessToken ? accessToken.id : undefined;

            return tokenID;
          }, description: 'Do not supply this argument, it is automatically extracted ' +
            'from request headers.',
          },
        ],
        http: {verb: 'all'},
      }
    );

    UserModel.remoteMethod(
      'prototype.verify',
      {
        description: 'Trigger user\'s identity verification with configured verifyOptions',
        accepts: [
          {arg: 'verifyOptions', type: 'object', http: ctx => this.getVerifyOptions()},
          {arg: 'options', type: 'object', http: 'optionsFromRequest'},
        ],
        http: {verb: 'post'},
      }
    );

    UserModel.remoteMethod(
      'confirm',
      {
        description: 'Confirm a user registration with identity verification token.',
        accepts: [
          {arg: 'uid', type: 'string', required: true},
          {arg: 'token', type: 'string', required: true},
          {arg: 'redirect', type: 'string'},
        ],
        http: {verb: 'get', path: '/confirm'},
      }
    );

    UserModel.remoteMethod(
      'resetPassword',
      {
        description: 'Reset password for a user with email.',
        accepts: [
          {arg: 'options', type: 'object', required: true, http: {source: 'body'}},
        ],
        http: {verb: 'post', path: '/reset'},
      }
    );

    UserModel.remoteMethod(
      'changePassword',
      {
        description: 'Change a user\'s password.',
        accepts: [
          {arg: 'id', type: 'any', http: getUserIdFromRequestContext},
          {arg: 'oldPassword', type: 'string', required: true, http: {source: 'form'}},
          {arg: 'newPassword', type: 'string', required: true, http: {source: 'form'}},
          {arg: 'options', type: 'object', http: 'optionsFromRequest'},
        ],
        http: {verb: 'POST', path: '/change-password'},
      }
    );

    const setPasswordScopes = UserModel.settings.restrictResetPasswordTokenScope ?
      ['reset-password'] : undefined;

    UserModel.remoteMethod(
      'setPassword',
      {
        description: 'Reset user\'s password via a password-reset token.',
        accepts: [
          {arg: 'id', type: 'any', http: getUserIdFromRequestContext},
          {arg: 'newPassword', type: 'string', required: true, http: {source: 'form'}},
          {arg: 'options', type: 'object', http: 'optionsFromRequest'},
        ],
        accessScopes: setPasswordScopes,
        http: {verb: 'POST', path: '/reset-password'},
      }
    );

    function getUserIdFromRequestContext(ctx) {
      const token = ctx.req.accessToken;
      if (!token) return;

      const hasPrincipalType = 'principalType' in token;
      if (hasPrincipalType && token.principalType !== UserModel.modelName) {
        // We have multiple user models related to the same access token model
        // and the token used to authorize reset-password request was created
        // for a different user model.
        const err = new Error(g.f('Access Denied'));
        err.statusCode = 403;
        throw err;
      }

      return token.userId;
    }

    UserModel.afterRemote('confirm', function(ctx, inst, next) {
      if (ctx.args.redirect !== undefined) {
        if (!ctx.res) {
          return next(new Error(g.f('The transport does not support HTTP redirects.')));
        }
        ctx.res.location(ctx.args.redirect);
        ctx.res.status(302);
      }
      next();
    });

    // default models
    assert(loopback.Email, 'Email model must be defined before User model');
    UserModel.email = loopback.Email;

    assert(loopback.AccessToken, 'AccessToken model must be defined before User model');
    UserModel.accessToken = loopback.AccessToken;

    UserModel.validate('email', emailValidator, {
      message: g.f('Must provide a valid email'),
    });

    // Realm users validation
    if (UserModel.settings.realmRequired && UserModel.settings.realmDelimiter) {
      UserModel.validatesUniquenessOf('email', {
        message: 'Email already exists',
        scopedTo: ['realm'],
      });
      UserModel.validatesUniquenessOf('username', {
        message: 'User already exists',
        scopedTo: ['realm'],
      });
    } else {
      // Regular(Non-realm) users validation
      UserModel.validatesUniquenessOf('email', {message: 'Email already exists'});
      UserModel.validatesUniquenessOf('username', {message: 'User already exists'});
    }

    return UserModel;
  }