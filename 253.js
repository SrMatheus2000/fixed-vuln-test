function embedVimeoIframe(e){
		var elem = e.currentTarget;
		var id = elem.getAttribute('data-vimeo');
		var vimeoParams = elem.getAttribute('data-vimeoparams') || '';

		elem.removeEventListener('click', embedVimeoIframe);

		if (!id || !regValidParam.test(id) || (vimeoParams && !regValidParam.test(vimeoParams))) {
			return;
		}

		if(vimeoParams && !regAmp.test(vimeoParams)){
			vimeoParams = '&'+ vimeoParams;
		}

		e.preventDefault();

		elem.innerHTML = '<iframe src="' + (vimeoIframe.replace(regId, id)) + vimeoParams +'" ' +
			'frameborder="0" allowfullscreen="" width="640" height="390"></iframe>'
		;

	}