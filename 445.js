(Options, ReceivedPath) => {

	const HasNullByte = ReceivedPath.indexOf('\0') !== -1;
	const HasPathTraversal = Path.join(Options.RootFolder, ReceivedPath).indexOf(Options.RootFolder) !== 0;

	if (HasNullByte || HasPathTraversal) {
		return true;
	}
}