function _allocate(bytes) {
  if (!this._buffer) {
    this._buffer = Buffer.alloc(Math.max(BUFFER_ALLOC_SIZE, bytes));
    this._offset = 0;
    return;
  }

  var bytesRemaining = this._buffer.length - this._offset;
  if (bytesRemaining >= bytes) {
    return;
  }

  var newSize   = this._buffer.length + Math.max(BUFFER_ALLOC_SIZE, bytes);
  var oldBuffer = this._buffer;

  this._buffer = Buffer.alloc(newSize);
  oldBuffer.copy(this._buffer);
}