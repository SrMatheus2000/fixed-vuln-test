function unique_name_585 (jwt, options, key, allowed_algs)
{
    if (allowed_algs === undefined)
    {
        allowed_algs = key;
        key = options;
        options = null;
    }

    this.verifyJWSByKey(jwt, key, allowed_algs);

    options = options || {};

    var header = this.getParsedHeader(),
        claims = this.getParsedPayload(),
        now = Math.floor(new Date().getTime() / 1000),
        iat_skew = options.iat_skew || 0;

    if (!header)
    {
        throw new Error('no header');
    }

    if (!claims)
    {
        throw new Error('no claims');
    }

    if (header.typ === undefined)
    {
        if (!options.checks_optional)
        {
            throw new Error('no type claim');
        }
    }
    else if (header.typ !== 'JWT')
    {
        throw new Error('type is not JWT');
    }

    if (claims.iat === undefined)
    {
        if (!options.checks_optional)
        {
            throw new Error('no issued at claim');
        }
    }
    else if (claims.iat > (now + iat_skew))
    {
        throw new Error('issued in the future');
    }

    if (claims.nbf === undefined)
    {
        if (!options.checks_optional)
        {
            throw new Error('no not before claim');
        }
    }
    else if (claims.nbf > now)
    {
        throw new Error('not yet valid');
    }

    if (claims.exp === undefined)
    {
        if (!options.checks_optional)
        {
            throw new Error("no expires claim");
        }
    }
    else if (claims.exp <= now)
    {
        throw new Error("expired");
    }

    return true;
}