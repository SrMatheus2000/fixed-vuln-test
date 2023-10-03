function unique_name_453(opts) {
  if(!opts) opts = {};
  var urlOpts;
  var self = this;
  
  urlOpts = {
    'response_type': 'code',
    'client_id': self.clientId,
    //client secret is not needed according to http://wiki.developerforce.com/page/Digging_Deeper_into_OAuth_2.0_on_Force.com
    //'client_secret': self.clientSecret,
    'redirect_uri': self.redirectUri
  }

  if(opts.display) {
    urlOpts.display = opts.display.toLowerCase();
  }

  if(opts.immediate) {
    urlOpts.immediate = opts.immediate;
  }

  if(opts.scope) {
    if(typeof opts.scope === 'object') {
      urlOpts.scope = opts.scope.join(' ');
    }
  }

  if(opts.state) {
    urlOpts.state = opts.state;
  }

  if(self.environment == 'sandbox') {
    return TEST_AUTH_ENDPOINT + '?' + qs.stringify(urlOpts);
  } else {
    return AUTH_ENDPOINT + '?' + qs.stringify(urlOpts);
  }
}