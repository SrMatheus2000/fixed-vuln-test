function parseAssignment () {
    var name, args, value, valid;

    var node = parseConditional();

    if (token == '=') {
      if (type.isSymbolNode(node)) {
        // parse a variable assignment like 'a = 2/3'
        name = node.name;
        getTokenSkipNewline();
        value = parseAssignment();
        return new AssignmentNode(new SymbolNode(name), value);
      }
      else if (type.isAccessorNode(node)) {
        // parse a matrix subset assignment like 'A[1,2] = 4'
        getTokenSkipNewline();
        value = parseAssignment();
        return new AssignmentNode(node.object, node.index, value);
      }
      else if (type.isFunctionNode(node) && type.isSymbolNode(node.fn)) {
        // parse function assignment like 'f(x) = x^2'
        valid = true;
        args = [];

        name = node.name;
        node.args.forEach(function (arg, index) {
          if (type.isSymbolNode(arg)) {
            args[index] = arg.name;
          }
          else {
            valid = false;
          }
        });

        if (valid) {
          getTokenSkipNewline();
          value = parseAssignment();
          return new FunctionAssignmentNode(name, args, value);
        }
      }

      throw createSyntaxError('Invalid left hand side of assignment operator =');
    }

    return node;
  }