function escapeShellArg(arg) {
  return arg.replace(/\u{0}/gu, "").replace(/'/g, `'\\''`);
}