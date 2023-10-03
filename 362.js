(value, traps, deepTraps, flags, mock) => {
	try {
		if (Contextified.has(value)) {
			// Contextified object has returned back from vm
			return Contextified.get(value);
		} else if (Decontextify.proxies.has(value)) {
			// Decontextified proxy already exists, reuse
			return Decontextify.proxies.get(value);
		}

		switch (typeof value) {
			case 'object':
				if (value === null) {
					return null;
				} else if (instanceOf(value, Number))         { return host.Number(value);
				} else if (instanceOf(value, String))         { return host.String(value);
				} else if (instanceOf(value, Boolean))        { return host.Boolean(value);
				} else if (instanceOf(value, Date))           { return Decontextify.instance(value, host.Date, deepTraps, flags);
				} else if (instanceOf(value, RangeError))     { return Decontextify.instance(value, host.RangeError, deepTraps, flags);
				} else if (instanceOf(value, ReferenceError)) { return Decontextify.instance(value, host.ReferenceError, deepTraps, flags);
				} else if (instanceOf(value, SyntaxError))    { return Decontextify.instance(value, host.SyntaxError, deepTraps, flags);
				} else if (instanceOf(value, TypeError))      { return Decontextify.instance(value, host.TypeError, deepTraps, flags);
				} else if (instanceOf(value, VMError))        { return Decontextify.instance(value, host.VMError, deepTraps, flags);
				} else if (instanceOf(value, EvalError))      { return Decontextify.instance(value, host.EvalError, deepTraps, flags);
				} else if (instanceOf(value, URIError))       { return Decontextify.instance(value, host.URIError, deepTraps, flags);
				} else if (instanceOf(value, Error))          { return Decontextify.instance(value, host.Error, deepTraps, flags);
				} else if (instanceOf(value, Array))          { return Decontextify.instance(value, host.Array, deepTraps, flags);
				} else if (instanceOf(value, RegExp))         { return Decontextify.instance(value, host.RegExp, deepTraps, flags);
				} else if (instanceOf(value, Map))            { return Decontextify.instance(value, host.Map, deepTraps, flags);
				} else if (instanceOf(value, WeakMap))        { return Decontextify.instance(value, host.WeakMap, deepTraps, flags);
				} else if (instanceOf(value, Set))            { return Decontextify.instance(value, host.Set, deepTraps, flags);
				} else if (instanceOf(value, WeakSet))        { return Decontextify.instance(value, host.WeakSet, deepTraps, flags);
				} else if (Promise && instanceOf(value, Promise)) { return Decontextify.instance(value, host.Promise, deepTraps, flags);
				} else if (local.Reflect.getPrototypeOf(value) === null) {
					return Decontextify.instance(value, null, deepTraps, flags);
				} else {
					return Decontextify.object(value, traps, deepTraps, flags, mock);
				}
			case 'function':
				return Decontextify.function(value, traps, deepTraps, flags, mock);

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