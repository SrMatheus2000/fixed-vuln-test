function cmdSet(key, val) {
  var objVal = val;

  try {
    var strTest = /^[\'\"](.*?)[\'\"]$/.exec(val);
    if (!strTest || strTest.length !== 2) { // do not parse if explicitly a string
      objVal = JSON5.parse(val); // attempt to parse
    } else {
      objVal = strTest[1];
    }
  } catch(ex) {
    // use as existing string
  }

  instance.setProp(key, objVal);
  rl.write(': stored as type ' + typeof objVal);

  enterCommand();
}