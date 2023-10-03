function nativeTimingSafeEqual(a, b) {
    var strA = String(a);
    var strB = String(b);
    var aLen = Buffer.byteLength(strA);
    var bLen = Buffer.byteLength(strB);

    // Always use length of a to avoid leaking the length. Even if this is a
    // false positive because one is a prefix of the other, the explicit length
    // check at the end will catch that.
    var bufA = bufferAlloc(aLen, 0, 'utf8');
    bufA.write(strA);
    var bufB = bufferAlloc(aLen, 0, 'utf8');
    bufB.write(strB);

    return crypto.timingSafeEqual(bufA, bufB) && aLen === bLen;
}