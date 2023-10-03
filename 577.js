async(request, response) => {
  if (isRestricted(request.params.url)) {
    response.status(403).send('Render request forbidden, domain excluded');
    return;
  }

  try {
    const start = now();
    const result = await renderer.captureScreenshot(request.params.url, request.query, config).catch((err) => console.error(err));
    const img = new Buffer(result, 'base64');
    response.set({
      'Content-Type': 'image/jpeg',
      'Content-Length': img.length
    });
    response.end(img);
    track('screenshot', now() - start);
  } catch (err) {
    response.status(400).send('Cannot render requested URL');
    console.error(err);
  }
}