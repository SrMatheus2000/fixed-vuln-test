function unique_name_122 (commandOrArgs, optionsOrCallback, callbackMaybe) {
	const callback = [
		optionsOrCallback,
		callbackMaybe,
		defaultCallback,
	].find(isFunction);
	const options = [
		optionsOrCallback,
		callbackMaybe,
		defaultOptions,
	].find(isObject);

	// Strip `git ` from the beginning since it's reduntant
	if (isString(commandOrArgs) && commandOrArgs.startsWith("git ")) {
		commandOrArgs = commandOrArgs.substring(4);
	}
	const execBinary = options.gitExec || "git";
	const execOptions = {
		cwd: options.cwd,
		windowsHide: true,
	};
	const execArguments = isString(commandOrArgs)
		? commandOrArgs.split(" ")
		: commandOrArgs;
	return execFile(execBinary, execArguments, execOptions).then(
		({stdout}) => callback(stdout, null),
		(error) => {
			if (callback.length === 1) {
				throw error;
			} else {
				// The callback is interested in the error, try to catch it.
				return callback("", error);
			}
		},
	);
}