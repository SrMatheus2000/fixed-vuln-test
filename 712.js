function valid(email) {
  if (!email) {
    return false; // email empty or undefined
  }
  var at = email.search("@");
  if (at < 0) {
    return false; // missing "@" symbol
  }
  var user = email.substr(0, at);
  var domain = email.substr(at + 1);
  var userLen = user.length;
  var domainLen = domain.length;
  if (userLen < 1 || userLen > 64) {
    return false; // user part length exceeded
  }
  if (domainLen < 1 || domainLen > 255) {
    return false; // domain part length exceeded
  }
  if (user.charAt(0) === "." || user.charAt(userLen - 1) === ".") {
    return false; // user part starts or ends with '.'
  }
  if (user.match(/\.\./)) {
    return false; // user part has two consecutive dots
  }
  if (!domain.match(/^[A-Za-z0-9.-]+$/)) {
    return false; // character not valid in domain part
  }
  if (domain.match(/\\.\\./)) {
    return false; // domain part has two consecutive dots
  }
  if (!user.match(/^[A-Za-z0-9!#%&`_=\\/$\'*+?^{}|~.\-" ]+$/)) {
    return false; // user part has invalid characters
  }

  return true;
}