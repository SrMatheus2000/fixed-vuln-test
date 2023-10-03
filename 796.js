function unique_name_433(writer) {
  if (this.protocol41) {
    writer.writeUnsignedNumber(4, this.clientFlags);
    writer.writeUnsignedNumber(4, this.maxPacketSize);
    writer.writeUnsignedNumber(1, this.charsetNumber);
    writer.writeFiller(23);
    writer.writeNullTerminatedString(this.user);
    writer.writeLengthCodedBuffer(this.scrambleBuff);
    writer.writeNullTerminatedString(this.database);
  } else {
    writer.writeUnsignedNumber(2, this.clientFlags);
    writer.writeUnsignedNumber(3, this.maxPacketSize);
    writer.writeNullTerminatedString(this.user);
    writer.writeBuffer(this.scrambleBuff);
    if (this.database && this.database.length) {
      writer.writeFiller(1);
      writer.writeBuffer(Buffer.from(this.database));
    }
  }
}