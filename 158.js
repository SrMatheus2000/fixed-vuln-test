function sync(os) {
  var stdio = os.stdio===undefined? STDIO:os.stdio;
  var {file, args} = command(os);
  return cp.execFileSync(file, args, {stdio});
}