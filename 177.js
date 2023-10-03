function unique_name_95(error) {
  if (
    !error.response ||
    !error.response.request ||
    (!error.response.request._data && !error.response.request._header)
  ) {
    return error;
  }

  sanitizeErrors(error.response.request._header);
  sanitizeErrors(error.response.request._data);

  return error;
}