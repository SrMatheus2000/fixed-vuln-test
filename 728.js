function unique_name_401 () {
  'use strict';

  function validDataUrl(s) {
    return validDataUrl.regex.test((s || '').trim());
  }
  validDataUrl.regex = /^data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)$/i;

  return validDataUrl;
}