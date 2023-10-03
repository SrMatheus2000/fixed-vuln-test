function unique_name_583(sJWS, key, allowed_algs) {
	this.parseJWS(sJWS, (!key) || !key.verifyString);
    var headP = this.parsedJWS.headP;
    var alg = headP.alg;
    if (alg === undefined)
    {
        throw new Error('alg not present');
    }
    allowed_algs = allowed_algs || [];
    function is_allowed(a)
    {
        if (Array.isArray(allowed_algs))
        {
            return allowed_algs.indexOf(a) >= 0;
        }
        else
        {
            return allowed_algs[a] !== undefined;
        }
    }
    if (!is_allowed(alg))
    {
        throw new Error('algorithm not allowed: ' + alg);
    }

    if (alg === 'none')
    {
        return true;
    }
    if (!key)
    {
        if (!is_allowed('none'))
        {
            throw new Error('no key but none alg not allowed');
        }
        return true;
    }

    var hashAlg = _jws_getHashAlgFromParsedHead(headP);
    alg = alg.substr(0, 2);
    var isPSS = alg === "PS";
    var r;

	if (key.hashAndVerify) {
	    r = key.hashAndVerify(hashAlg,
				     new Buffer(this.parsedJWS.si, 'utf8'),
				     new Buffer(b64utob64(this.parsedJWS.sigvalB64U), 'base64'),
				     null,
				     isPSS);
	} else if (isPSS) {
	    r = key.verifyStringPSS(this.parsedJWS.si,
				       this.parsedJWS.sigvalH, hashAlg);
	} else if (alg === "HS") {
        r = const_time_equal(hmac(hashAlg, key, this.parsedJWS.si), b64utob64(this.parsedJWS.sigvalB64U));
    } else {
	    r = key.verifyString(this.parsedJWS.si,
				    this.parsedJWS.sigvalH);
	}
    if (!r)
    {
        throw new Error('failed to verify');
    }
    return r;
    }