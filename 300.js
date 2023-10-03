(node, output, state) => {
			let code;
			if (node.lang && highlight.getLanguage(node.lang))
				code = highlight.highlight(node.lang, node.content, true); // Discord seems to set ignoreIllegals: true

			if (code && state.cssModuleNames) // Replace classes in hljs output
				code.value = code.value.replace(/<span class="([a-z0-9-_ ]+)">/gi, (str, m) =>
					str.replace(m, m.split(' ').map(cl => state.cssModuleNames[cl] || cl).join(' ')));

			return htmlTag('pre', htmlTag(
				'code', code ? code.value : markdown.sanitizeText(node.content), { class: `hljs${code ? ' ' + code.language : ''}` }, state
			), null, state);
		}