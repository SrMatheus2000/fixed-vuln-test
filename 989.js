function decodeToken(token){
      if(!this.secret) throw(new Error("Secret not set"));
      this.encoded = false;
      this.token = token || this.token;

      var tokenString   = fernet.decode64toHex(this.token);
      var versionOffset = fernet.hexBits(8);
      var timeOffset    = versionOffset + fernet.hexBits(64);
      var ivOffset      = timeOffset + fernet.hexBits(128);
      var hmacOffset    = tokenString.length - fernet.hexBits(256);
      var timeInt       = fernet.parseHex(tokenString.slice(versionOffset, timeOffset));

      this.version  = fernet.parseHex(tokenString.slice(0,versionOffset));

      if(this.version != 128){
        throw new Error("Invalid version");
      }

      this.time     = new Date(timeInt * 1000);

      var timeDiff = ((new Date()) - this.time) / 1000;

      if(this.ttl > 0 && timeDiff > this.ttl) {
        throw new Error("Invalid Token: TTL");
      }
      this.ivHex    = tokenString.slice(timeOffset, ivOffset);
      this.iv       = fernet.Hex.parse(this.ivHex);
      this.cipherTextHex = tokenString.slice(ivOffset, hmacOffset);
      this.cipherText = fernet.Hex.parse(this.cipherTextHex);
      this.hmacHex    = tokenString.slice(hmacOffset);
      var decodedHmac = fernet.createHmac(this.secret.signingKey, fernet.timeBytes(this.time), this.iv, this.cipherText);
      var decodedHmacHex = decodedHmac.toString(fernet.Hex);

      var accum = 0
      for(var i=0;i<64;i++){
        accum += decodedHmacHex.charCodeAt(i) ^ this.hmacHex.charCodeAt(i)
      }
      if(accum != 0) throw new Error("Invalid Token: HMAC");

      this.message     = fernet.decryptMessage(this.cipherText, this.secret.encryptionKey, this.iv)
      return this.message;
    }