function unique_name_470(req,res){
		console.log('Serving: %s',req.url);
		var rs = fs.createReadStream(__dirname+path.normalize(req.url).replace(/^(\.\.[\/\\])+/, ''),{
			flags: 'r',
			autoClose: true
		});
		rs.on('open',function(){
			rs.pipe(res);
		});
		rs.on('error',function(e){
			res.end(e+'');
		});
	}