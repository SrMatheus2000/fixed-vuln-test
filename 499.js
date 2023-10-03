function _typed(name, signatures) {
      var refs = new Refs();

      // parse signatures, expand them
      var _signatures = parseSignatures(signatures);
      if (_signatures.length == 0) {
        throw new Error('No signatures provided');
      }

      // filter all any type signatures
      var anys = filterAnyTypeSignatures(_signatures);

      // parse signatures into a node tree
      var node = parseTree(_signatures, [], anys);

      //var util = require('util');
      //console.log('ROOT');
      //console.log(util.inspect(node, { depth: null }));

      // generate code for the typed function
      // safeName is a conservative replacement of characters 
      // to prevend being able to inject JS code at the place of the function name 
      // the name is useful for stack trackes therefore we want have it there
      var code = [];
      var safeName = (name || '').replace(/[^a-zA-Z0-9_$]/g, '_')
      var args = getArgs(maxParams(_signatures));
      code.push('function ' + safeName + '(' + args.join(', ') + ') {');
      code.push('  "use strict";');
      code.push('  var name = ' + JSON.stringify(name || '') + ';');
      code.push(node.toCode(refs, '  ', false));
      code.push('}');

      // generate body for the factory function
      var body = [
        refs.toCode(),
        'return ' + code.join('\n')
      ].join('\n');

      // evaluate the JavaScript code and attach function references
      var factory = (new Function(refs.name, 'createError', body));
      var fn = factory(refs, createError);

      //console.log('FN\n' + fn.toString()); // TODO: cleanup

      // attach the signatures with sub-functions to the constructed function
      fn.signatures = mapSignatures(_signatures);

      return fn;
    }