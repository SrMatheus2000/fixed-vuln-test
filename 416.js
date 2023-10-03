function unique_name_208(src,dest,callback)
	{
		//guard against injection
		src = src.split(';')[0];
		dest = dest.split(';')[0];

		switch(_os.type())
		{
			case 'Windows_NT' :
				_cp.exec('robocopy "'+src+'" "'+dest+'" /e',
					function(err,stdout,stderr)
					{
						if( err && err.code == 1 )
							callback(undefined,stdout,stderr);
						else
							callback(err,stdout,stderr);
					});
				break;

			case 'Linux'  :
			case 'Darwin' :
				_cp.exec('cp -R "'+src+'" "'+dest+'"',callback);
				break;

			default:
				throw 'unsupported OS :: '+_os.type();
		}
	}