async function unique_name_37(destination, { hard = true } = {}) {
	if (destination && typeof destination === 'string') {
		try {
			await spawn(`check-ref-format ${destination}`);
		} catch (error) {
			throw new RangeError('can not reset to illegal ref "${destination}"');
		}

		return await spawn(`reset ${destination} ${hard ? '--hard' : ''}`);
	}

	if (destination && typeof destination === 'number') {
		return await spawn(`reset HEAD~${Math.abs(destination)} ${hard ? '--hard' : ''}`);
	}

	throw new TypeError(`No case for handling destination ${destination} (${typeof destination})`);
}