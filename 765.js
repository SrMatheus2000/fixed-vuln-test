function unique_name_418 () {
		// We want to render the raw markdown string, without parsing it to html
		// The markdown string *itself* may include html though so we need to escape it first
		const innerHtml = (this.props.value && this.props.value.md)
			? escapeHtmlForRender(this.props.value.md)
			: '';

		return (
			<FormInput
				dangerouslySetInnerHTML={{ __html: innerHtml }}
				multiline
				noedit
			/>
		);
	}