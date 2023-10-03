function merge(merged, source, mergeOpts) {
	if (mergeOpts.concatArrays && Array.isArray(merged) && Array.isArray(source)) {
		return concatArrays(merged, source, mergeOpts);
	}

	if (!isOptionObject(source) || !isOptionObject(merged)) {
		return clone(source);
	}

	return mergeKeys(merged, source, getEnumerableOwnPropertyKeys(source), mergeOpts);
}