function apply(doc, patch, options) {
  if (typeof patch !== OBJECT || patch === null || Array.isArray(patch)) {
    return patch;
  }

  options = options || Object.create(null);

  if (typeof doc !== OBJECT || doc === null || Array.isArray(doc)) {
    doc = Object.create(options.proto || null);
  }

  const keys = Object.keys(patch);
  for (const key of keys) {
    if (options.pollute !== true && key === "__proto__") {
      throw new Error("Prototype pollution attempt");
    }
    const v = patch[key];
    if (v === null) {
      delete doc[key];
      continue;
    }
    doc[key] = apply(doc[key], v);
  }

  return doc;
}