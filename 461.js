function unique_name_239(_super) {
    __extends(OperationView, _super);

    function OperationView() {
      _ref4 = OperationView.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    OperationView.prototype.invocationUrl = null;

    OperationView.prototype.events = {
      'submit .sandbox': 'submitOperation',
      'click .submit': 'submitOperation',
      'click .response_hider': 'hideResponse',
      'click .toggleOperation': 'toggleOperationContent',
      'mouseenter .api-ic': 'mouseEnter',
      'mouseout .api-ic': 'mouseExit'
    };

    OperationView.prototype.initialize = function() {};

    OperationView.prototype.mouseEnter = function(e) {
      var elem, hgh, pos, scMaxX, scMaxY, scX, scY, wd, x, y;
      elem = $(e.currentTarget.parentNode).find('#api_information_panel');
      x = e.pageX;
      y = e.pageY;
      scX = $(window).scrollLeft();
      scY = $(window).scrollTop();
      scMaxX = scX + $(window).width();
      scMaxY = scY + $(window).height();
      wd = elem.width();
      hgh = elem.height();
      if (x + wd > scMaxX) {
        x = scMaxX - wd;
      }
      if (x < scX) {
        x = scX;
      }
      if (y + hgh > scMaxY) {
        y = scMaxY - hgh;
      }
      if (y < scY) {
        y = scY;
      }
      pos = {};
      pos.top = y;
      pos.left = x;
      elem.css(pos);
      return $(e.currentTarget.parentNode).find('#api_information_panel').show();
    };

    OperationView.prototype.mouseExit = function(e) {
      return $(e.currentTarget.parentNode).find('#api_information_panel').hide();
    };

    OperationView.prototype.render = function() {
      var contentTypeModel, isMethodSubmissionSupported, k, o, param, responseContentTypeView, responseSignatureView, signatureModel, statusCode, type, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref5, _ref6, _ref7, _ref8;
      isMethodSubmissionSupported = true;
      if (!isMethodSubmissionSupported) {
        this.model.isReadOnly = true;
      }
      this.model.oauth = null;
      if (this.model.authorizations) {
        _ref5 = this.model.authorizations;
        for (k in _ref5) {
          v = _ref5[k];
          if (k === "oauth2") {
            if (this.model.oauth === null) {
              this.model.oauth = {};
            }
            if (this.model.oauth.scopes === void 0) {
              this.model.oauth.scopes = [];
            }
            for (_i = 0, _len = v.length; _i < _len; _i++) {
              o = v[_i];
              this.model.oauth.scopes.push(o);
            }
          }
        }
      }
      $(this.el).html(Handlebars.templates.operation(this.model));
      if (this.model.responseClassSignature && this.model.responseClassSignature !== 'string') {
        signatureModel = {
          sampleJSON: this.model.responseSampleJSON,
          isParam: false,
          signature: this.model.responseClassSignature
        };
        responseSignatureView = new SignatureView({
          model: signatureModel,
          tagName: 'div'
        });
        $('.model-signature', $(this.el)).append(responseSignatureView.render().el);
      } else {
        $('.model-signature', $(this.el)).html(this.model.type);
      }
      contentTypeModel = {
        isParam: false
      };
      contentTypeModel.consumes = this.model.consumes;
      contentTypeModel.produces = this.model.produces;
      _ref6 = this.model.parameters;
      for (_j = 0, _len1 = _ref6.length; _j < _len1; _j++) {
        param = _ref6[_j];
        type = param.type || param.dataType;
        if (type.toLowerCase() === 'file') {
          if (!contentTypeModel.consumes) {
            log("set content type ");
            contentTypeModel.consumes = 'multipart/form-data';
          }
        }
      }
      responseContentTypeView = new ResponseContentTypeView({
        model: contentTypeModel
      });
      $('.response-content-type', $(this.el)).append(responseContentTypeView.render().el);
      _ref7 = this.model.parameters;
      for (_k = 0, _len2 = _ref7.length; _k < _len2; _k++) {
        param = _ref7[_k];
        this.addParameter(param, contentTypeModel.consumes);
      }
      _ref8 = this.model.responseMessages;
      for (_l = 0, _len3 = _ref8.length; _l < _len3; _l++) {
        statusCode = _ref8[_l];
        this.addStatusCode(statusCode);
      }
      return this;
    };

    OperationView.prototype.addParameter = function(param, consumes) {
      var paramView;
      param.consumes = consumes;
      paramView = new ParameterView({
        model: param,
        tagName: 'tr',
        readOnly: this.model.isReadOnly
      });
      return $('.operation-params', $(this.el)).append(paramView.render().el);
    };

    OperationView.prototype.addStatusCode = function(statusCode) {
      var statusCodeView;
      statusCodeView = new StatusCodeView({
        model: statusCode,
        tagName: 'tr'
      });
      return $('.operation-status', $(this.el)).append(statusCodeView.render().el);
    };

    OperationView.prototype.submitOperation = function(e) {
      var error_free, form, isFileUpload, map, o, opts, val, _i, _j, _k, _len, _len1, _len2, _ref5, _ref6, _ref7;
      if (e != null) {
        e.preventDefault();
      }
      form = $('.sandbox', $(this.el));
      error_free = true;
      form.find("input.required").each(function() {
        var _this = this;
        $(this).removeClass("error");
        if (jQuery.trim($(this).val()) === "") {
          $(this).addClass("error");
          $(this).wiggle({
            callback: function() {
              return $(_this).focus();
            }
          });
          return error_free = false;
        }
      });
      if (error_free) {
        map = {};
        opts = {
          parent: this
        };
        isFileUpload = false;
        _ref5 = form.find("input");
        for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
          o = _ref5[_i];
          if ((o.value != null) && jQuery.trim(o.value).length > 0) {
            map[o.name] = o.value;
          }
          if (o.type === "file") {
            isFileUpload = true;
          }
        }
        _ref6 = form.find("textarea");
        for (_j = 0, _len1 = _ref6.length; _j < _len1; _j++) {
          o = _ref6[_j];
          if ((o.value != null) && jQuery.trim(o.value).length > 0) {
            map["body"] = o.value;
          }
        }
        _ref7 = form.find("select");
        for (_k = 0, _len2 = _ref7.length; _k < _len2; _k++) {
          o = _ref7[_k];
          val = this.getSelectedValue(o);
          if ((val != null) && jQuery.trim(val).length > 0) {
            map[o.name] = val;
          }
        }
        opts.responseContentType = $("div select[name=responseContentType]", $(this.el)).val();
        opts.requestContentType = $("div select[name=parameterContentType]", $(this.el)).val();
        $(".response_throbber", $(this.el)).show();
        if (isFileUpload) {
          return this.handleFileUpload(map, form);
        } else {
          return this.model["do"](map, opts, this.showCompleteStatus, this.showErrorStatus, this);
        }
      }
    };

    OperationView.prototype.success = function(response, parent) {
      return parent.showCompleteStatus(response);
    };

    OperationView.prototype.handleFileUpload = function(map, form) {
      var bodyParam, el, headerParams, o, obj, param, params, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref5, _ref6, _ref7, _ref8,
        _this = this;
      _ref5 = form.serializeArray();
      for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
        o = _ref5[_i];
        if ((o.value != null) && jQuery.trim(o.value).length > 0) {
          map[o.name] = o.value;
        }
      }
      bodyParam = new FormData();
      params = 0;
      _ref6 = this.model.parameters;
      for (_j = 0, _len1 = _ref6.length; _j < _len1; _j++) {
        param = _ref6[_j];
        if (param.paramType === 'form') {
          if (param.type.toLowerCase() !== 'file' && map[param.name] !== void 0) {
            bodyParam.append(param.name, map[param.name]);
          }
        }
      }
      headerParams = {};
      _ref7 = this.model.parameters;
      for (_k = 0, _len2 = _ref7.length; _k < _len2; _k++) {
        param = _ref7[_k];
        if (param.paramType === 'header') {
          headerParams[param.name] = map[param.name];
        }
      }
      log(headerParams);
      _ref8 = form.find('input[type~="file"]');
      for (_l = 0, _len3 = _ref8.length; _l < _len3; _l++) {
        el = _ref8[_l];
        if (typeof el.files[0] !== 'undefined') {
          bodyParam.append($(el).attr('name'), el.files[0]);
          params += 1;
        }
      }
      this.invocationUrl = this.model.supportHeaderParams() ? (headerParams = this.model.getHeaderParams(map), this.model.urlify(map, false)) : this.model.urlify(map, true);
      $(".request_url", $(this.el)).html("<pre></pre>");
      $(".request_url pre", $(this.el)).text(this.invocationUrl);
      obj = {
        type: this.model.method,
        url: this.invocationUrl,
        headers: headerParams,
        data: bodyParam,
        dataType: 'json',
        contentType: false,
        processData: false,
        error: function(data, textStatus, error) {
          return _this.showErrorStatus(_this.wrap(data), _this);
        },
        success: function(data) {
          return _this.showResponse(data, _this);
        },
        complete: function(data) {
          return _this.showCompleteStatus(_this.wrap(data), _this);
        }
      };
      if (window.authorizations) {
        window.authorizations.apply(obj);
      }
      if (params === 0) {
        obj.data.append("fake", "true");
      }
      jQuery.ajax(obj);
      return false;
    };

    OperationView.prototype.wrap = function(data) {
      var h, headerArray, headers, i, o, _i, _len;
      headers = {};
      headerArray = data.getAllResponseHeaders().split("\r");
      for (_i = 0, _len = headerArray.length; _i < _len; _i++) {
        i = headerArray[_i];
        h = i.split(':');
        if (h[0] !== void 0 && h[1] !== void 0) {
          headers[h[0].trim()] = h[1].trim();
        }
      }
      o = {};
      o.content = {};
      o.content.data = data.responseText;
      o.headers = headers;
      o.request = {};
      o.request.url = this.invocationUrl;
      o.status = data.status;
      return o;
    };

    OperationView.prototype.getSelectedValue = function(select) {
      var opt, options, _i, _len, _ref5;
      if (!select.multiple) {
        return select.value;
      } else {
        options = [];
        _ref5 = select.options;
        for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
          opt = _ref5[_i];
          if (opt.selected) {
            options.push(opt.value);
          }
        }
        if (options.length > 0) {
          return options.join(",");
        } else {
          return null;
        }
      }
    };

    OperationView.prototype.hideResponse = function(e) {
      if (e != null) {
        e.preventDefault();
      }
      $(".response", $(this.el)).slideUp();
      return $(".response_hider", $(this.el)).fadeOut();
    };

    OperationView.prototype.showResponse = function(response) {
      var prettyJson;
      prettyJson = JSON.stringify(response, null, "\t").replace(/\n/g, "<br>");
      return $(".response_body", $(this.el)).html(escape(prettyJson));
    };

    OperationView.prototype.showErrorStatus = function(data, parent) {
      return parent.showStatus(data);
    };

    OperationView.prototype.showCompleteStatus = function(data, parent) {
      return parent.showStatus(data);
    };

    OperationView.prototype.formatXml = function(xml) {
      var contexp, formatted, indent, lastType, lines, ln, pad, reg, transitions, wsexp, _fn, _i, _len;
      reg = /(>)(<)(\/*)/g;
      wsexp = /[ ]*(.*)[ ]+\n/g;
      contexp = /(<.+>)(.+\n)/g;
      xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
      pad = 0;
      formatted = '';
      lines = xml.split('\n');
      indent = 0;
      lastType = 'other';
      transitions = {
        'single->single': 0,
        'single->closing': -1,
        'single->opening': 0,
        'single->other': 0,
        'closing->single': 0,
        'closing->closing': -1,
        'closing->opening': 0,
        'closing->other': 0,
        'opening->single': 1,
        'opening->closing': 0,
        'opening->opening': 1,
        'opening->other': 1,
        'other->single': 0,
        'other->closing': -1,
        'other->opening': 0,
        'other->other': 0
      };
      _fn = function(ln) {
        var fromTo, j, key, padding, type, types, value;
        types = {
          single: Boolean(ln.match(/<.+\/>/)),
          closing: Boolean(ln.match(/<\/.+>/)),
          opening: Boolean(ln.match(/<[^!?].*>/))
        };
        type = ((function() {
          var _results;
          _results = [];
          for (key in types) {
            value = types[key];
            if (value) {
              _results.push(key);
            }
          }
          return _results;
        })())[0];
        type = type === void 0 ? 'other' : type;
        fromTo = lastType + '->' + type;
        lastType = type;
        padding = '';
        indent += transitions[fromTo];
        padding = ((function() {
          var _j, _ref5, _results;
          _results = [];
          for (j = _j = 0, _ref5 = indent; 0 <= _ref5 ? _j < _ref5 : _j > _ref5; j = 0 <= _ref5 ? ++_j : --_j) {
            _results.push('  ');
          }
          return _results;
        })()).join('');
        if (fromTo === 'opening->closing') {
          return formatted = formatted.substr(0, formatted.length - 1) + ln + '\n';
        } else {
          return formatted += padding + ln + '\n';
        }
      };
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        ln = lines[_i];
        _fn(ln);
      }
      return formatted;
    };

    OperationView.prototype.showStatus = function(response) {
      var code, content, contentType, headers, opts, pre, response_body, response_body_el, url;
      if (response.content === void 0) {
        content = response.data;
        url = response.url;
      } else {
        content = response.content.data;
        url = response.request.url;
      }
      headers = response.headers;
      contentType = headers && headers["Content-Type"] ? headers["Content-Type"].split(";")[0].trim() : null;
      if (!content) {
        code = $('<code />').text("no content");
        pre = $('<pre class="json" />').append(code);
      } else if (contentType === "application/json" || /\+json$/.test(contentType)) {
        code = $('<code />').text(JSON.stringify(JSON.parse(content), null, "  "));
        pre = $('<pre class="json" />').append(code);
      } else if (contentType === "application/xml" || /\+xml$/.test(contentType)) {
        code = $('<code />').text(this.formatXml(content));
        pre = $('<pre class="xml" />').append(code);
      } else if (contentType === "text/html") {
        code = $('<code />').html(content);
        pre = $('<pre class="xml" />').append(code);
      } else if (/^image\//.test(contentType)) {
        pre = $('<img>').attr('src', url);
      } else {
        code = $('<code />').text(content);
        pre = $('<pre class="json" />').append(code);
      }
      response_body = pre;
      $(".request_url", $(this.el)).html("<pre></pre>");
      $(".request_url pre", $(this.el)).text(url);
      $(".response_code", $(this.el)).html("<pre>" + response.status + "</pre>");
      $(".response_body", $(this.el)).html(response_body);
      $(".response_headers", $(this.el)).html("<pre>" + _.escape(JSON.stringify(response.headers, null, "  ")).replace(/\n/g, "<br>") + "</pre>");
      $(".response", $(this.el)).slideDown();
      $(".response_hider", $(this.el)).show();
      $(".response_throbber", $(this.el)).hide();
      response_body_el = $('.response_body', $(this.el))[0];
      opts = this.options.swaggerOptions;
      if (opts.highlightSizeThreshold && response.data.length > opts.highlightSizeThreshold) {
        return response_body_el;
      } else {
        return hljs.highlightBlock(response_body_el);
      }
    };

    OperationView.prototype.toggleOperationContent = function() {
      var elem;
      elem = $('#' + Docs.escapeResourceName(this.model.parentId) + "_" + this.model.nickname + "_content");
      if (elem.is(':visible')) {
        return Docs.collapseOperation(elem);
      } else {
        return Docs.expandOperation(elem);
      }
    };

    return OperationView;

  }