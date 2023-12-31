function suggestPassword(passwd_form)
{
    // restrict the password to just letters and numbers to avoid problems:
    // "editors and viewers regard the password as multiple words and
    // things like double click no longer work"
    var pwchars = "abcdefhjmnpqrstuvwxyz23456789ABCDEFGHJKLMNPQRSTUVWYXZ";
    var passwordlength = 16;    // do we want that to be dynamic?  no, keep it simple :)
    var passwd = passwd_form.generated_pw;
    var randomWords = new Int32Array(passwordlength);

    passwd.value = '';

    // First we're going to try to use a built-in CSPRNG
    if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(randomWords);
    }
    // Because of course IE calls it msCrypto instead of being standard
    else if (window.msCrypto && window.msCrypto.getRandomValues) {
        window.msCrypto.getRandomValues(randomWords);
    } else {
        // Fallback to Math.random
        for (var i = 0; i < passwordlength; i++) {
            randomWords[i] = Math.floor(Math.random() * pwchars.length);
        }
    }

    for (var i = 0; i < passwordlength; i++) {
        passwd.value += pwchars.charAt(Math.abs(randomWords[i]) % pwchars.length);
    }

    passwd_form.text_pma_pw.value = passwd.value;
    passwd_form.text_pma_pw2.value = passwd.value;
    return true;
}