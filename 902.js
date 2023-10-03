function JSONPPolling (mng, data, req) {
  HTTPPolling.call(this, mng, data, req);

  this.head = 'io.j[0](';
  this.foot = ');';

  if (data.query.i && jsonpolling_re.test(data.query.i)) {
    this.head = 'io.j[' + data.query.i + '](';
  }
}