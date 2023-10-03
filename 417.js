function unique_name_209(dir,callback)
	{
		//guard against injection
		dir = dir.split(';')[0];

		switch(_os.type())
		{
			case 'Windows_NT' :
				_cp.exec('dir /s /b "'+dir+'"',
					function(err, stdout, stderr)
					{
						if( err )
							callback(err,stdout,stderr);
						else
						{
							let windir = (dir.charAt(0)=='.' ? dir.substring(1) : dir).
								replace(/\//g,'\\'),
								paths  = stdout.split('\r\n').map(
									function(path)
									{
										let newpath = dir+path.substring(
											path.indexOf(windir)+windir.length).
										replace(/\\/g,'/');
										try {
											if (_fs.lstatSync(path).isDirectory()) {
												newpath = newpath + '/';
											}
										} catch (e) {
											console.log("Error!");
											console.log(e);
										}
										return newpath;
									});
							paths.pop();
							callback(err,paths.join('\n'),stderr);
						}
					});
				break;

			case 'Linux'  :
			case 'Darwin' :
				_cp.exec('find "'+dir+'"',
					function(err, stdout, stderr)
					{
						if( err )
							callback(err,stdout,stderr);
						else {
							let paths = stdout.slice(0,-1),
								newpaths = paths.split('\n').map(function(path) {
									if (_fs.lstatSync(path).isDirectory()) {
										return path + "/";
									} else return path;
								});
							callback(err,newpaths.join('\n'),stderr);
						}
					});
				break;

			default:
				throw 'unsupported OS :: '+_os.type();
		}
	}