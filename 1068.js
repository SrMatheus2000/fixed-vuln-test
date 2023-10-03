function unique_name_632() {
				// Load saved config
				var	_self = this,
					fields = [
						'html', 'xhtmlOut', 'breaks', 'langPrefix', 'linkify', 'typographer'
					],
					defaults = {
						'html': false,
						'xhtmlOut': true,
						'breaks': true,
						'langPrefix': 'language-',
						'linkify': true,
						'typographer': false,
						'highlight': true,
						'highlightTheme': 'railscasts.css'
					};

				meta.settings.get('markdown', function(err, options) {
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
				});
			}