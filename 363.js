(value, traps, deepTraps, flags, mock) => {
	try {
		if (Decontextified.has(value)) {
			// Decontextified object has returned back to vm
			return Decontextified.get(value);
		} else if (Contextify.proxies.has(value)) {
			// Contextified proxy already exists, reuse
			return Contextify.proxies.get(value);
		}

		switch (typeof value) {
			case 'object':
				if (value === null) {
					return null;
				} else if (instanceOf(value, host.Number))         { return host.Number(value);
				} else if (instanceOf(value, host.String))         { return host.String(value);
				} else if (instanceOf(value, host.Boolean))        { return host.Boolean(value);
				} else if (instanceOf(value, host.Date))           { return Contextify.instance(value, Date, deepTraps, flags);
				} else if (instanceOf(value, host.RangeError))     { return Contextify.instance(value, RangeError, deepTraps, flags);
				} else if (instanceOf(value, host.ReferenceError)) { return Contextify.instance(value, ReferenceError, deepTraps, flags);
				} else if (instanceOf(value, host.SyntaxError))    { return Contextify.instance(value, SyntaxError, deepTraps, flags);
				} else if (instanceOf(value, host.TypeError))      { return Contextify.instance(value, TypeError, deepTraps, flags);
				} else if (instanceOf(value, host.VMError))        { return Contextify.instance(value, VMError, deepTraps, flags);
				} else if (instanceOf(value, host.EvalError))      { return Contextify.instance(value, EvalError, deepTraps, flags);
				} else if (instanceOf(value, host.URIError))       { return Contextify.instance(value, URIError, deepTraps, flags);
				} else if (instanceOf(value, host.Error))          { return Contextify.instance(value, Error, deepTraps, flags);
				} else if (instanceOf(value, host.Array))          { return Contextify.instance(value, Array, deepTraps, flags);
				} else if (instanceOf(value, host.RegExp))         { return Contextify.instance(value, RegExp, deepTraps, flags);
				} else if (instanceOf(value, host.Map))            { return Contextify.instance(value, Map, deepTraps, flags);
				} else if (instanceOf(value, host.WeakMap))        { return Contextify.instance(value, WeakMap, deepTraps, flags);
				} else if (instanceOf(value, host.Set))            { return Contextify.instance(value, Set, deepTraps, flags);
				} else if (instanceOf(value, host.WeakSet))        { return Contextify.instance(value, WeakSet, deepTraps, flags);
				} else if (instanceOf(value, host.Promise))        { return Contextify.instance(value, Promise, deepTraps, flags);
				} else if (instanceOf(value, host.Buffer))         { return Contextify.instance(value, LocalBuffer, deepTraps, flags);
				} else if (host.Reflect.getPrototypeOf(value) === null) {
					return Contextify.instance(value, null, deepTraps, flags);
				} else {
					return Contextify.object(value, traps, deepTraps, flags, mock);
				}
			case 'function':
				return Contextify.function(value, traps, deepTraps, flags, mock);

			case 'undefined':
				return undefined;

			default: // string, number, boolean, symbol
				return value;
		}
	} catch (ex) {
		// Never pass the handled expcetion through! This block can't throw an exception under normal conditions.
		return null;
	}
}