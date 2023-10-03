(publicKey, entry, callback) => {
  const { value, validityType, validity } = entry
  const dataForSignature = ipnsEntryDataForSig(value, validityType, validity)

  // Validate Signature
  publicKey.verify(dataForSignature, entry.signature, (err, isValid) => {
    if (err || !isValid) {
      log.error('record signature verification failed')
      return callback(Object.assign(new Error('record signature verification failed'), { code: ERRORS.ERR_SIGNATURE_VERIFICATION }))
    }

    // Validate according to the validity type
    if (validityType === ipnsEntryProto.ValidityType.EOL) {
      let validityDate

      try {
        validityDate = parseRFC3339(validity.toString())
      } catch (e) {
        log.error('unrecognized validity format (not an rfc3339 format)')
        return callback(Object.assign(new Error('unrecognized validity format (not an rfc3339 format)'), { code: ERRORS.ERR_UNRECOGNIZED_FORMAT }))
      }

      if (validityDate < Date.now()) {
        log.error('record has expired')
        return callback(Object.assign(new Error('record has expired'), { code: ERRORS.ERR_IPNS_EXPIRED_RECORD }))
      }
    } else if (validityType) {
      log.error('unrecognized validity type')
      return callback(Object.assign(new Error('unrecognized validity type'), { code: ERRORS.ERR_UNRECOGNIZED_VALIDITY }))
    }

    log(`ipns entry for ${value} is valid`)
    return callback(null, null)
  })
}