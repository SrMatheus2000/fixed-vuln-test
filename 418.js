function unique_name_210(dir,callback)
	{
		//guard against injection
		dir = dir.split(';')[0];

		let split_dir = dir.split('/'),
			curr_dir = '';
		for (let i in split_dir) {
			curr_dir += split_dir[i] + '/';
			if (!_fs.existsSync(curr_dir)) {
				_fs.mkdir(curr_dir, 484, function(err) {if (err) {if (err.code != 'EEXIST') callback(err);}});
			}
		}
		callback();
	}