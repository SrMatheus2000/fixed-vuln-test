function unique_name_309(max) {
	// gives a number between 0 (inclusive) and max (exclusive)
	var rand = crypto.randomBytes(1)[0];
	while (rand >= max - (256 % max)) {
		rand = crypto.randomBytes(1)[0];
	}
	return rand % max;
}