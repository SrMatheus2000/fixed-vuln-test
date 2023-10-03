async function unique_name_200() {
      switch (algo) {
        case enums.publicKey.rsa_encrypt:
        case enums.publicKey.rsa_encrypt_sign: {
          const m = data.toBN();
          const n = pub_params[0].toBN();
          const e = pub_params[1].toBN();
          const res = await publicKey.rsa.encrypt(m, n, e);
          return constructParams(types, [res]);
        }
        case enums.publicKey.elgamal: {
          const m = data.toBN();
          const p = pub_params[0].toBN();
          const g = pub_params[1].toBN();
          const y = pub_params[2].toBN();
          const res = await publicKey.elgamal.encrypt(m, p, g, y);
          return constructParams(types, [res.c1, res.c2]);
        }
        case enums.publicKey.ecdh: {
          const oid = pub_params[0];
          const Q = pub_params[1].toUint8Array();
          const kdf_params = pub_params[2];
          const { V, C } = await publicKey.elliptic.ecdh.encrypt(
            oid, kdf_params.cipher, kdf_params.hash, data, Q, fingerprint);
          return constructParams(types, [new BN(V), C]);
        }
        default:
          return [];
      }
    }