function setupSocket(server) {
  var wss = new Wss({
    server: server,
    verifyClient: function(info, cb) {
      if (validateRequest(info.req)) {
        log.info(info.req, null, "WebSocket [", chalk.green("connected"), "] ");
        cb(true);
      } else {
        log.info(info.req, {statusCode: 401}, "Unauthorized WebSocket connection rejected.");
        cb(false, 401, "Unauthorized");
      }
    }
  });
  if (typeof config.keepAlive === "number" && config.keepAlive > 0) {
    Object.keys(wss.clients).forEach(function(client) {
      client.ws.ping();
    });
  }
  wss.on("connection", function(ws) {
    var sid = ws._socket.remoteAddress + " " + ws._socket.remotePort;
    var cookie = cookies.get(ws.upgradeReq.headers.cookie);
    clients[sid] = {views: [], cookie: cookie, ws: ws};

    ws.on("message", function(msg) {
      msg = JSON.parse(msg);

      if (msg.type !== "SAVE_FILE") {
        log.debug(ws, null, chalk.magenta("RECV "), utils.pretty(msg));
      }

      if (!csrf.validate(msg.token)) {
        log.info(ws, null, "WebSocket [", chalk.red("disconnected"), "] ", "(CSFR prevented or server restarted)");
        ws.close(1011);
        return;
      }

      var vId = msg.vId;
      switch (msg.type) {
      case "REQUEST_SETTINGS":
        sendObj(sid, {type: "SETTINGS", vId: vId, settings: {
          version       : pkg.version,
          debug         : config.debug,
          demo          : config.demo,
          public        : config.public,
          engine        : [engine, process.version.substring(1)].join(" "),
          caseSensitive : process.platform !== "win32",
          themes        : Object.keys(cache.themes).join("|"),
          modes         : Object.keys(cache.modes).join("|"),
        }});
        break;
      case "REQUEST_UPDATE":
        if (!utils.isPathSane(msg.data)) return log.info(ws, null, "Invalid update request: " + msg.data);
        if (!clients[sid]) clients[sid] = {views: [], ws: ws}; // This can happen when the server restarts
        fs.stat(utils.addFilesPath(msg.data), function(err, stats) {
          var clientDir, clientFile;
          if (err) { // Send client back to root when the requested path doesn't exist
            clientDir = "/";
            clientFile = null;
            log.error(err);
            log.info(ws, null, "Non-existing update request, sending client to / : " + msg.data);
          } else if (stats.isFile()) {
            clientDir = path.dirname(msg.data);
            clientFile = path.basename(msg.data);
            sendObj(sid, {type: "UPDATE_BE_FILE", file: clientFile, folder: clientDir, isFile: true, vId: vId});
          } else {
            clientDir = msg.data;
            clientFile = null;
          }
          clients[sid].views[vId] = {file: clientFile, directory: clientDir};
          if (!clientFile) {
            updateClientLocation(clientDir, sid, vId);
            sendFiles(sid, vId);
          }
        });
        break;
      case "DESTROY_VIEW":
        clients[sid].views[vId] = null;
        break;
      case "REQUEST_SHARELINK":
        if (!utils.isPathSane(msg.data.location)) return log.info(ws, null, "Invalid share link request: " + msg.data);
        var link, links = db.get("links");

        // Check if we already have a link for that file
        var hadLink = Object.keys(links).some(function(link) {
          if (msg.data.location === links[link].location && msg.data.attachement === links[link].attachement) {
            sendObj(sid, {type: "SHARELINK", vId: vId, link: link, attachement: msg.data.attachement});
            return true;
          }
        });
        if (hadLink) break;

        link = utils.getLink(links, config.linkLength);
        log.info(ws, null, "Share link created: " + link + " -> " + msg.data.location);
        sendObj(sid, {type: "SHARELINK", vId: vId, link: link, attachement: msg.data.attachement});
        links[link] = {location: msg.data.location, attachement: msg.data.attachement};
        db.set("links", links);
        break;
      case "DELETE_FILE":
        log.info(ws, null, "Deleting: " + msg.data);
        if (!utils.isPathSane(msg.data)) return log.info(ws, null, "Invalid file deletion request: " + msg.data);
        filetree.del(msg.data);
        break;
      case "SAVE_FILE":
        log.info(ws, null, "Saving: " + msg.data.to);
        if (!utils.isPathSane(msg.data.to)) return log.info(ws, null, "Invalid save request: " + msg.data);
        filetree.save(msg.data.to, msg.data.value, function(err) {
          if (err)
            sendObj(sid, {type: "ERROR", vId: vId, text: "Error saving " + msg.data.to + ": " + err});
          else
            sendObj(sid, {type: "SAVE_STATUS", vId: vId, status : err ? 1 : 0});
        });
        break;
      case "CLIPBOARD":
        log.info(ws, null, "Clipboard " + msg.data.type + ": " + msg.data.src + " -> " + msg.data.dst);
        if (!utils.isPathSane(msg.data.src)) return log.info(ws, null, "Invalid clipboard src: " + msg.data.src);
        if (!utils.isPathSane(msg.data.dst)) return log.info(ws, null, "Invalid clipboard dst: " + msg.data.dst);
        if (new RegExp("^" + msg.data.src + "/").test(msg.data.dst))
          return sendObj(sid, {type: "ERROR", vId: vId, text: "Can't copy directory into itself"});

        fs.lstat(utils.addFilesPath(msg.data.dst), function(err, stats) {
          if (!err && stats || msg.data.src === msg.data.dst) {
            utils.getNewPath(utils.addFilesPath(msg.data.dst), function(newDst) {
              filetree.clipboard(msg.data.src, utils.removeFilesPath(newDst), msg.data.type);
            });
          } else {
            filetree.clipboard(msg.data.src, msg.data.dst, msg.data.type);
          }
        });
        break;
      case "CREATE_FOLDER":
        if (!utils.isPathSane(msg.data)) return log.info(ws, null, "Invalid directory creation request: " + msg.data);
        filetree.mkdir(msg.data);
        break;
      case "CREATE_FILE":
        if (!utils.isPathSane(msg.data)) return log.info(ws, null, "Invalid file creation request: " + msg.data);
        filetree.mk(msg.data);
        break;
      case "RENAME":
        // Disallow whitespace-only and empty strings in renames
        if (!utils.isPathSane(msg.data.dst) || /^\s*$/.test(msg.data.dst) || msg.data.dst === "" || msg.data.src === msg.data.dst) {
          log.info(ws, null, "Invalid rename request: " + msg.data.src + "-> " + msg.data.dst);
          sendObj(sid, {type: "ERROR", text: "Invalid rename request"});
          return;
        }
        filetree.move(msg.data.src, msg.data.dst);
        break;
      case "GET_USERS":
        if (db.get("sessions")[cookie] && db.get("sessions")[cookie].privileged) {
          sendUsers(sid);
        } else { // Unauthorized
          sendObj(sid, {type: "USER_LIST", users: {}});
        }
        break;
      case "UPDATE_USER":
        var name = msg.data.name, pass = msg.data.pass;
        if (!db.get("sessions")[cookie] || !db.get("sessions")[cookie].privileged) return;
        if (pass === "") {
          if (!db.get("users")[name]) return;
          if (db.delUser(msg.data.name)) log.info(ws, null, "Deleted user: ", chalk.magenta(name));
          sendUsers(sid);
        } else {
          var isNew = !db.get("users")[name];
          db.addOrUpdateUser(name, pass, msg.data.priv);
          if (isNew)
            log.info(ws, null, "Added user: ", chalk.magenta(name));
          else
            log.info(ws, null, "Updated user: ", chalk.magenta(name));
          sendUsers(sid);
        }
        if (db.get("sessions")[cookie].privileged) sendUsers(sid);
        break;
      case "CREATE_FILES":
        async.each(msg.data.files, function(file, cb) {
          if (!utils.isPathSane(file)) return cb(new Error("Invalid file creation request: " + file));
          filetree.mkdir(utils.addFilesPath(path.dirname(file)), function() {
            filetree.mk(utils.addFilesPath(file), cb);
          });
        }, function(err) {
          if (err) log.error(ws, null, err);
        });
        break;
      case "CREATE_FOLDERS":
        async.each(msg.data.folders, function(folder, cb) {
          if (!utils.isPathSane(folder)) return cb(new Error("Invalid folder creation request: " + folder));
          filetree.mkdir(utils.addFilesPath(folder), cb);
        }, function(err) {
          if (err) log.error(ws, null, err);
        });
        break;
      }
    });

    ws.on("close", function(code) {
      var reason;
      if (code === 4001) {
        reason = "(Logged out)";
        var sessions = db.get("sessions");
        delete sessions[cookie];
        db.set("sessions", sessions);
      } else if (code === 1001) {
        reason = "(Going away)";
      }
      removeClientPerDir(sid);
      delete clients[sid];
      if (code !== 1011)
        log.info(ws, null, "WebSocket [", chalk.red("disconnected"), "] ", reason || "(Code: " + (code || "none") + ")");
    });

    ws.on("error", log.error);
  });
}