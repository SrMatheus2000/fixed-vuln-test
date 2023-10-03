function unique_name_74(str) {
		str = str.replace(/^\s*|\s*$/g, '');
		str = str.replace(/^\t*|\t*$/g, '');

		// Practical implementation of RFC 5322
		// https://www.regular-expressions.info/email.html
		return (/^[a-z0-9!#$%&'*+/=?^_‘{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_‘{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(str));
	}