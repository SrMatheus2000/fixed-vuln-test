function nativeTimingSafeEqual(a, b) {
    var strA = String(a);
    var strB = String(b);
    
    var len = Math.max(Buffer.byteLength(strA), Buffer.byteLength(strB));
    
    var bufA = bufferAlloc(len, 0, 'utf8');
    bufA.write(strA);
    var bufB = bufferAlloc(len, 0, 'utf8');
    bufB.write(strB);
    
    return crypto.timingSafeEqual(bufA, bufB);
}