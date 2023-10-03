function unique_name_211(path) {
	//guard against injection
	path = path.split(';')[0];

	if( _fs.existsSync(path) ) {
		_fs.readdirSync(path).forEach(function(file,index){
			let curPath = path + "/" + file;
			if(_fs.lstatSync(curPath).isDirectory()) { // recurse
				exports.deleteFolderRecursive(curPath);
			} else { // delete file
				_fs.unlinkSync(curPath);
			}
		});
		_fs.rmdirSync(path);
	}
}