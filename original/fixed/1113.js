function(cb){

    // Get the Pad
    db.findKeys("pad:"+padId, null, function(err,padcontent){
      if(!err){
        cb(err, padcontent);
      }
    })
  }