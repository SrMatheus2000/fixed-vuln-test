function pointFpMultiply(k) {
    if(this.isInfinity()) return this;
    if(k.signum() == 0) return this.curve.getInfinity();

    // initialize for multiply
    var e = k; // e = k
    var h = e.multiply(new BigInteger("3"));
    var neg = this.negate();
    var R = this;

    // initialize for dummy to mitigate timing attack
    var e2 = this.curve.q.subtract(k); // e2 = q - k
    var h2 = e2.multiply(new BigInteger("3"));
    var R2 = new ECPointFp(this.curve, this.x, this.y);
    var neg2 = R2.negate();

    // calculate multiply
    var i;
    for(i = h.bitLength() - 2; i > 0; --i) {
	R = R.twice();

	var hBit = h.testBit(i);
	var eBit = e.testBit(i);

	if (hBit != eBit) {
	    R = R.add(hBit ? this : neg);
	}
    }

    // calculate dummy to mitigate timing attack
    for(i = h2.bitLength() - 2; i > 0; --i) {
	R2 = R2.twice();

	var h2Bit = h2.testBit(i);
	var e2Bit = e2.testBit(i);

	if (h2Bit != e2Bit) {
	    R2 = R2.add(h2Bit ? R2 : neg2);
	}
    }

    return R;
}