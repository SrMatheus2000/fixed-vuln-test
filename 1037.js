function openSocket() {
    var protocol = document.location.protocol === "https:" ? "wss://" : "ws://";
    droppy.socket = new WebSocket(protocol + document.location.host + "/?socket");
    droppy.socket.onopen = function() {
      if (droppy.token) {
        init();
      } else {
        $.get("?@").then(function(token) {
          droppy.token = token;
          init();
        });
      }
    };

    // Close codes: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Close_codes
    droppy.socket.onclose = function(event) {
      if (droppy.get("hasLoggedOut") || event.code === 4000) return;
      if (event.code === 1011) {
        droppy.token = null;
        openSocket();
      } else if (event.code >= 1001 && event.code < 3999) {
        if (retries > 0) {
          // Gracefully reconnect on abnormal closure of the socket, 1 retry every 4 seconds, 20 seconds total.
          // TODO: Indicate connection drop in the UI, especially on close code 1006
          setTimeout(function() {
            openSocket();
            retries--;
          }, retryTimeout);
        }
      } else if (droppy.reopen) {
        droppy.reopen = false;
        openSocket();
      }
    };

    droppy.socket.onmessage = function(event) {
      var view, msg, vId;
      droppy.socketWait = false;
      msg = JSON.parse(event.data);
      vId = msg.vId;
      switch (msg.type) {
      case "UPDATE_DIRECTORY":
        view = getView(vId);
        if (typeof view.data("type") === "undefined" || view[0].switchRequest) view.data("type", "directory"); // For initial loading
        if (!view.length) return;

        if (view.data("type") === "directory") {
          if (msg.folder !== getViewLocation(view)) {
            view[0].currentFile = null;
            view[0].currentFolder = msg.folder;
            if (view[0].vId === 0) updateTitle(basename(msg.folder));
            replaceHistory(view, join(view[0].currentFolder, view[0].currentFile));
            updatePath(view);
          }
          view[0].switchRequest = false;
          view[0].currentData = msg.data;
          openDirectory(view);
        } else if (view.data("type") === "media") {
          view[0].currentData = msg.data;
          populateMediaCache(view, msg.data);
          updateMediaMeta(view);
          bindMediaArrows(view);
        }
        break;
      case "UPDATE_BE_FILE":
        openFile(getView(vId), msg.folder, msg.file);
        break;
      case "RELOAD":
        if (msg.css) {
          $("#css").remove();
          $("<style id='css'></style>").text(msg.css).appendTo($("head"));
        } else location.reload(true);
        break;
      case "SHARELINK":
        view = getView(vId);
        hideSpinner(view);
        droppy.linkCache.push({
          location: view[0].sharelinkId,
          link: msg.link,
          attachement: msg.attachement,
        });
        showLink(view, msg.link, msg.attachement);
        break;
      case "USER_LIST":
        updateUsers(msg.users);
        break;
      case "SAVE_STATUS":
        view = getView(vId);
        hideSpinner(view);

        var file = view.find(".path li:last-child");
        var oldStyle = file.attr("style");

        file.find("svg").css("transition", "fill .2s ease");
        file.removeClass("dirty").attr("style", "transition: background .2s ease;")
          .addClass(msg.status === 0 ? "saved" : "save-failed");
        setTimeout(function() {
          file.removeClass("saved save-failed").end(function() {
            $(this).attr("style", oldStyle);
            $(this).children("svg").removeAttr("style");
          });
        }, 1000);
        break;
      case "SETTINGS":
        Object.keys(msg.settings).forEach(function(setting) {
          droppy[setting] = msg.settings[setting];
        });

        $("#about-title").text("droppy " + droppy.version);
        $("#about-engine").text(droppy.engine);

        droppy.themes = droppy.themes.split("|");
        droppy.modes = droppy.modes.split("|");

        // Move own theme to top of theme list
        droppy.themes.pop();
        droppy.themes.unshift("droppy");

        // Insert plain mode on the top
        droppy.modes.unshift("plain");

        if (droppy.demo || droppy.public)
          $("#logout-button").addClass("disabled")
            .register("click", showError.bind(null, getView(0), "Signing out is disabled"));
        else
          $("#logout-button").register("click", function() {
            droppy.set("hasLoggedOut", true);
            if (droppy.socket) droppy.socket.close(4001);
            history.pushState(null, null, getRootPath());
            location.reload(true);
          });
        break;
      case "ERROR":
        view = getView(vId);
        showError(view, msg.text);
        hideSpinner(view);
        break;
      }
    };
  }