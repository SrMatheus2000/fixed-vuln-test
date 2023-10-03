function isSafe(userAgent) {
  var consecutive = 0
    , code = 0;

  if (userAgent.length > 1000) return false;

  for (var i = 0; i < userAgent.length; i++) {
    code = userAgent.charCodeAt(i);
    // numbers between 0 and 9, letters between a and z, spaces and control
    if ((code >= 48 && code <= 57) || (code >= 97 && code <= 122) || code <= 32) {
      consecutive++;
    } else {
      consecutive = 0;
    }

    if (consecutive >= 100) {
      return false;
    }
  }

  return true
}