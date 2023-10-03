async port => {
	const portNumber = parseInt(port, 10);
	if (Number.isNaN(portNumber)) {
		console.error("Must provide number for port.");
		return;
	}
	try {
		const result = (await exec(`lsof -i :${portNumber}`)).output.split('\n');
		const headers = result.shift().split(' ').filter(item => !!item.trim() && item.trim() !== "").map(item => item.toLowerCase());
		return result.filter(item => !!item.trim() && item.trim() !== "").reduce((accumulator, currentValue) => {
			accumulator.push(currentValue.split(' ').filter(item => !!item.trim() && item.trim() !== "").reduce((accumulator, currentValue, index) => {
				if (index > headers.length - 1) {
					accumulator[headers[headers.length - 1]] = (!!accumulator[headers[headers.length - 1]].trim() && accumulator[headers[headers.length - 1]].trim() !== "") ? `${accumulator[headers[headers.length - 1]]} ${currentValue}` : currentValue;
				} else {
					accumulator[headers[index]] = currentValue;
				}
				return accumulator;
			}, {}));
			return accumulator;
		}, []);
	} catch (e) {
		console.error(e);
	}
}