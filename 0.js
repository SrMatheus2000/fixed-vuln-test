function unique_name_0 (n) {
  if (n === '.') return 1
  return Buffer.byteLength(n.replace(/^\.|\.$/gm, '')) + 2
}