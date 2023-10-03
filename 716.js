function generateColumnString(column) {
  const openingBracketPos = column.indexOf('(');
  const closingBracketPos = column.indexOf(')');
  const isFunction = openingBracketPos >= 0 && closingBracketPos > openingBracketPos;
  return isFunction
    ? column // expression
    : template`"${column}"`; // single column
}