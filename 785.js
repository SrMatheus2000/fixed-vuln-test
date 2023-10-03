function mergeBuffers(buffers) {
  var mergeBuffer  = Buffer.alloc(options.bufferSize);
  var mergeBuffers = [];
  var offset       = 0;

  for (var i = 0; i < buffers.length; i++) {
    var buffer = buffers[i];

    var bytesRemaining = mergeBuffer.length - offset;
    if (buffer.length < bytesRemaining) {
      buffer.copy(mergeBuffer, offset);
      offset += buffer.length;
    } else {
      buffer.copy(mergeBuffer, offset, 0, bytesRemaining);
      mergeBuffers.push(mergeBuffer);

      mergeBuffer = Buffer.alloc(options.bufferSize);
      buffer.copy(mergeBuffer, 0, bytesRemaining);
      offset = buffer.length - bytesRemaining;
    }
  }

  if (offset > 0) {
    mergeBuffers.push(mergeBuffer.slice(0, offset));
  }

  return mergeBuffers;
}