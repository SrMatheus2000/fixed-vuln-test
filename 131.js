function generate(target, hierarchies, forceOverride) {
	    var current = target;
	    hierarchies.forEach(function (info) {
	        var descriptor = normalizeDescriptor(info);
	        var value = descriptor.value, type = descriptor.type, create = descriptor.create, override = descriptor.override, created = descriptor.created, skipped = descriptor.skipped, got = descriptor.got;
	        var name = getNonEmptyPropName(current, descriptor);
	        if (forceOverride ||
	            override ||
	            !current[name] ||
	            typeof current[name] !== 'object' ||
	            (name === propProto && current[name] === Object.prototype)) {
	            var obj = value ? value :
	                type ? new type() :
	                    create ? create.call(current, current, name) :
	                        {};
	            current[name] = obj;
	            if (created) {
	                created.call(current, current, name, obj);
	            }
	        }
	        else {
	            if (skipped) {
	                skipped.call(current, current, name, current[name]);
	            }
	        }
	        var parent = current;
	        current = current[name];
	        if (got) {
	            got.call(parent, parent, name, current);
	        }
	    });
	    return current;
	}