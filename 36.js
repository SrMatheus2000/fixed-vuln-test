async function checkGraphvizInstalled(config) {
	const cmd = config.graphVizPath ? path.join(config.graphVizPath, 'gvpr') : 'gvpr';

	try {
		await exec(cmd, ['-V']);
	} catch (err) {
		throw new Error(`Graphviz could not be found. Ensure that "gvpr" is in your $PATH. ${err}`);
	}
}