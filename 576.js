async(request, response) => {
  if (isRestricted(request.params.url)) {
    response.status(403).send('Render request forbidden, domain excluded');
    return;
  }

  try {
    const start = now();
    const result = await renderer.serialize(request.params.url, request.query, config);
    response.status(result.status).send(result.body);
    track('render', now() - start);
  } catch (err) {
    response.status(400).send('Cannot render requested URL');
    console.error(err);
  }
}