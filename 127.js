function methodByPath(target, path) {
  path = pathToArray(path);

  const values = breadcrumbs(target, path);

  if (values.length < path.length) {
    return noop;
  }

  if (typeof values[values.length - 1] !== 'function') {
    return noop;
  }

  if (values.length > 1) {
    return values[values.length - 1].bind(values[values.length - 2]);
  }
  else {
    return values[0].bind(null);
  }
}