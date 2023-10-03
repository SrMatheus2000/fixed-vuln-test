function unique_name_466(api, connection, next){
		var fileName = ""
			,	path = require('path')
			;
		if((connection.params.fileName == null || typeof connection.params.fileName == "undefined") && connection.req != null){
			var parsedURL = api.url.parse(connection.req.url);
			var parts = parsedURL.pathname.split("/");
			
			parts.shift();
			if (connection.directModeAccess == true){ parts.shift(); }
			if (connection.requestMode == "api"){ parts.shift(); }
			
			for (var i in parts){
				if (fileName != ""){ fileName += "/"; }
				fileName += parts[i];
			}
		}else if(connection.req == null){
			// socket connection
			api.utils.requiredParamChecker(api, connection, ["fileName"]);
			if(connection.error === null){ fileName = connection.params.fileName; }
		}else{
			fileName = connection.params.fileName;
		}
		// verify the access is public
		fileName = path.normalize(api.configData.general.flatFileDirectory + fileName);
		if(fileName.indexOf(path.normalize(api.configData.general.flatFileDirectory))===0){
			if(connection.error === null){
				api.fileServer.followFileToServe(api, fileName, connection, next);
			}
		} else api.fileServer.sendFileNotFound(api, connection, next);
	}