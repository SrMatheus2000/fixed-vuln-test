async function createVerificationObjects(signatureList, literalDataList, keys, date=new Date()) {
  return Promise.all(signatureList.filter(function(signature) {
    return ['text', 'binary'].includes(enums.read(enums.signature, signature.signatureType));
  }).map(async function(signature) {
    return createVerificationObject(signature, literalDataList, keys, date);
  }));
}