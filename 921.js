function unique_name_521(left, right, context, create, expression) {
    return function(scope, locals, assign, inputs) {
      var lhs = left(scope, locals, assign, inputs);
      var rhs;
      var value;
      if (lhs != null) {
        rhs = right(scope, locals, assign, inputs);
        rhs = getStringValue(rhs);
        ensureSafeMemberName(rhs, expression);
        if (create && create !== 1) {
          ensureSafeAssignContext(lhs);
          if (lhs && !(lhs[rhs])) {
            lhs[rhs] = {};
          }
        }
        value = lhs[rhs];
        ensureSafeObject(value, expression);
      }
      if (context) {
        return {context: lhs, name: rhs, value: value};
      } else {
        return value;
      }
    };
  }