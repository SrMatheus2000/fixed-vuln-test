function extractProtocol(address) {
  address = trimLeft(address);

  var match = protocolre.exec(address)
    , protocol = match[1] ? match[1].toLowerCase() : ''
    , slashes = !!(match[2] && match[2].length >= 2);

  return {
    protocol: protocol,
    slashes: slashes,
    rest: match[3]
  };
}