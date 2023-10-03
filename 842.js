function growl(msg, options, fn) {
  var image
    , args
    , options = options || {}
    , fn = fn || function(){};

  if (options.exec) {
    cmd = {
        type: "Custom"
      , pkg: options.exec
      , range: []
    };
  }

  // noop
  if (!cmd) return fn(new Error('growl not supported on this platform'));
  args = [cmd.pkg];

  // image
  if (image = options.image) {
    switch(cmd.type) {
      case 'Darwin-Growl':
        var flag, ext = path.extname(image).substr(1)
        flag = flag || ext == 'icns' && 'iconpath'
        flag = flag || /^[A-Z]/.test(image) && 'appIcon'
        flag = flag || /^png|gif|jpe?g$/.test(ext) && 'image'
        flag = flag || ext && (image = ext) && 'icon'
        flag = flag || 'icon'
        args.push('--' + flag, image)
        break;
      case 'Darwin-NotificationCenter':
        args.push(cmd.icon, image);
        break;
      case 'Linux':
        args.push(cmd.icon, image);
        // libnotify defaults to sticky, set a hint for transient notifications
        if (!options.sticky) args.push('--hint=int:transient:1');
        break;
      case 'Windows':
        args.push(cmd.icon + image);
        break;
    }
  }

  // sticky
  if (options.sticky) args.push(cmd.sticky);

  // priority
  if (options.priority) {
    var priority = options.priority + '';
    var checkindexOf = cmd.priority.range.indexOf(priority);
    if (~cmd.priority.range.indexOf(priority)) {
      args.push(cmd.priority, options.priority);
    }
  }

  //sound
  if(options.sound && cmd.type === 'Darwin-NotificationCenter'){
    args.push(cmd.sound, options.sound)
  }

  // name
  if (options.name && cmd.type === "Darwin-Growl") {
    args.push('--name', options.name);
  }

  switch(cmd.type) {
    case 'Darwin-Growl':
      args.push(cmd.msg);
      args.push(msg.replace(/\\n/g, '\n'));
      if (options.title) args.push(options.title);
      break;
    case 'Darwin-NotificationCenter':
      args.push(cmd.msg);
      var stringifiedMsg = msg;
      var escapedMsg = stringifiedMsg.replace(/\\n/g, '\n');
      args.push(escapedMsg);
      if (options.title) {
        args.push(cmd.title);
        args.push(options.title);
      }
      if (options.subtitle) {
        args.push(cmd.subtitle);
        args.push(options.subtitle);
      }
      if (options.url) {
        args.push(cmd.url);
        args.push(options.url);
      }
      break;
    case 'Linux-Growl':
      args.push(cmd.msg);
      args.push(msg.replace(/\\n/g, '\n'));
      if (options.title) args.push(options.title);
      if (cmd.host) {
        args.push(cmd.host.cmd, cmd.host.hostname)
      }
      break;
    case 'Linux':
      if (options.title) {
        args.push(options.title);
        args.push(cmd.msg);
        args.push(msg.replace(/\\n/g, '\n'));
      } else {
        args.push(msg.replace(/\\n/g, '\n'));
      }
      break;
    case 'Windows':
      args.push(msg.replace(/\\n/g, '\n'));
      if (options.title) args.push(cmd.title + options.title);
      if (options.url) args.push(cmd.url + options.url);
      break;
    case 'Custom':
      args[0] = (function(origCommand) {
        var message = options.title
          ? options.title + ': ' + msg
          : msg;
        var command = origCommand.replace(/(^|[^%])%s/g, '$1' + message);
        if (command === origCommand) args.push(message);
        return command;
      })(args[0]);
      break;
  }
  var cmd_to_exec = args[0];
  args.shift();
  spawn(cmd_to_exec, args);
}