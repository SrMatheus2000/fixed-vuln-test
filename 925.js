function unique_name_524(scope, locals) {
      var args = [];
      var context = contextGetter ? contextGetter(scope, locals) : scope;

      for (var i = 0; i < argsFn.length; i++) {
        args.push(ensureSafeObject(argsFn[i](scope, locals), parser.text));
      }
      var fnPtr = fn(scope, locals, context) || noop;

      ensureSafeObject(context, parser.text);
      ensureSafeFunction(fnPtr, parser.text);

      // IE stupidity! (IE doesn't have apply for some native functions)
      var v = fnPtr.apply
            ? fnPtr.apply(context, args)
            : fnPtr(args[0], args[1], args[2], args[3], args[4]);

      return ensureSafeObject(v, parser.text);
    }