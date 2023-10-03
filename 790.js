function toBuffer(parser) {
  if (!this._buffer) {
    this._buffer = Buffer.alloc(0);
    this._offset = 0;
  }

  var buffer  = this._buffer;
  var length  = this._offset;
  var packets = Math.floor(length / MAX_PACKET_LENGTH) + 1;

  this._buffer = Buffer.allocUnsafe(length + packets * 4);
  this._offset = 0;

  for (var packet = 0; packet < packets; packet++) {
    var isLast = (packet + 1 === packets);
    var packetLength = (isLast)
      ? length % MAX_PACKET_LENGTH
      : MAX_PACKET_LENGTH;

    var packetNumber = parser.incrementPacketNumber();

    this.writeUnsignedNumber(3, packetLength);
    this.writeUnsignedNumber(1, packetNumber);

    var start = packet * MAX_PACKET_LENGTH;
    var end   = start + packetLength;

    this.writeBuffer(buffer.slice(start, end));
  }

  return this._buffer;
}