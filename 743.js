function nativeTimingSafeEqual(a, b) {
    var strA = String(a);
    var strB = String(b);
    
    var len = Math.max(Buffer.byteLength(strA), Buffer.byteLength(strB));
    
    var bufA = bufferAlloc(len, strA, 'utf8');
    var bufB = bufferAlloc(len, strB, 'utf8');
    
    return crypto.timingSafeEqual(bufA, bufB);
}