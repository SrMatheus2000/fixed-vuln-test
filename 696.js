function mimeWordsEncode (data = '', mimeWordEncoding = 'Q', fromCharset = 'UTF-8') {
  const regex = /[^ \u0080-\uFFFF]*[\u0080-\uFFFF][^ ]*( +[^ \u0080-\uFFFF]*[\u0080-\uFFFF][^ ]*)*/g
  return decode(convert(data, fromCharset)).replace(regex, match => mimeWordEncode(match, mimeWordEncoding, fromCharset))
}