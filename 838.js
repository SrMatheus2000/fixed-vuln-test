function unique_name_464(data){
    if(data.toRender === true){
      if(api.config.servers.web.metadataOptions.serverInformation){
        const stopTime = new Date().getTime();
        data.response.serverInformation = {
          serverName:      api.config.general.serverName,
          apiVersion:      api.config.general.apiVersion,
          requestDuration: (stopTime - data.connection.connectedAt),
          currentTime:     stopTime
        };
      }

      if(api.config.servers.web.metadataOptions.requesterInformation){
        data.response.requesterInformation = buildRequesterInformation(data.connection);
      }

      if(data.response.error){
        if(api.config.servers.web.returnErrorCodes === true && data.connection.rawConnection.responseHttpCode === 200){
          if(data.actionStatus === 'unknown_action'){
            data.connection.rawConnection.responseHttpCode = 404;
          }else if(data.actionStatus === 'missing_params'){
            data.connection.rawConnection.responseHttpCode = 422;
          }else if(data.actionStatus === 'server_error'){
            data.connection.rawConnection.responseHttpCode = 500;
          }else{
            data.connection.rawConnection.responseHttpCode = 400;
          }
        }
      }

      if(
          !data.response.error &&
          data.action &&
          data.params.apiVersion &&
          api.actions.actions[data.params.action][data.params.apiVersion].matchExtensionMimeType === true &&
          data.connection.extension
        ){
        data.connection.rawConnection.responseHeaders.push(['Content-Type', Mime.lookup(data.connection.extension)]);
      }

      if(data.response.error){
        data.response.error = api.config.errors.serializers.servers.web(data.response.error);
      }

      let stringResponse = '';

      if(extractHeader(data.connection, 'Content-Type').match(/json/)){
        stringResponse = JSON.stringify(data.response, null, api.config.servers.web.padding);
        if(data.params.callback){
          data.connection.rawConnection.responseHeaders.push(['Content-Type', 'application/javascript']);
          stringResponse = callbackHtmlEscape(data.connection.params.callback) + '(' + stringResponse + ');';
        }
      }else{
        stringResponse = data.response;
      }

      server.sendMessage(data.connection, stringResponse);
    }
  }