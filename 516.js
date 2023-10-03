function encrypt(value) {
        if (value == null) {
            throw new Error('value must not be null or undefined');
        }

        const iv = crypto.randomBytes(ivLength);
        const salt = crypto.randomBytes(saltLength);

        const key = getKey(salt);

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);

        const tag = cipher.getAuthTag();

        return Buffer.concat([salt, iv, tag, encrypted]).toString('hex');
    }