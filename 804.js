function unique_name_436(data,meta){

    em.stats.requestedWrites++;
    // just got a write save the time between last write and this.
    var now = Date.now();
    writes.push(now); 

    // write events are emitted with an array of data from all of the writes combined into one.
    if(meta) em.data.push(meta);

    if(writes.length > windowSize) writes.shift();

    data = data instanceof Buffer ? data : new Buffer(data+'');
    bufLen += data.length;

    buf.push(data);

    if(em.shouldWrite()) em._write();

  }