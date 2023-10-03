async function render(markup, theme, options) {
		const cacheKey = md5(escape(markup));
		let html = this.cache_.get(cacheKey);

		if (!html) {
			html = htmlUtils.sanitizeHtml(markup);

			html = htmlUtils.processImageTags(html, data => {
				if (!data.src) return null;

				const r = utils.imageReplacement(this.ResourceModel_, data.src, options.resources, this.resourceBaseUrl_);
				if (!r) return null;

				if (typeof r === 'string') {
					return {
						type: 'replaceElement',
						html: r,
					};
				} else {
					return {
						type: 'setAttributes',
						attrs: r,
					};
				}
			});
		}

		if (options.bodyOnly) return {
			html: html,
			pluginAssets: [],
		};

		this.cache_.put(cacheKey, html, 1000 * 60 * 10);

		const cssStrings = noteStyle(theme, options);
		const styleHtml = `<style>${cssStrings.join('\n')}</style>`;

		return {
			html: styleHtml + html,
			pluginAssets: [],
		};
	}