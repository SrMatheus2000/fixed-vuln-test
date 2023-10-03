function unique_name_631(err, options) {
					for(var field in defaults) {
						// If not set in config (nil)
						if (!options.hasOwnProperty(field)) {
							_self.config[field] = defaults[field];
						} else {
							if (field !== 'langPrefix' && field !== 'highlightTheme' && field !== 'headerPrefix') {
								_self.config[field] = options[field] === 'on' ? true : false;
							} else {
								_self.config[field] = options[field];
							}
						}
					}

					_self.highlight = _self.config.highlight || true;
					delete _self.config.highlight;

					parser = new MarkdownIt(_self.config);

					// Override the link validator from MarkdownIt, so you cannot link directly to a data-uri
					parser.validateLink = function(url) {
						var BAD_PROTOCOLS    = [ 'vbscript', 'javascript', 'file', 'data' ];
						var str = url.trim().toLowerCase();

						if (str.indexOf(':') >= 0 && BAD_PROTOCOLS.indexOf(str.split(':')[0]) >= 0) {
							return false;
						}
						return true;
					}
				}