function dataselectfn (sel){
		if( typeof(sel) === 'function' ){
			//handle false values in function directive
			return function ( ctxt ){
				var r = sel.call( ctxt.item || ctxt.context || ctxt, ctxt );
				return !r && r !== 0 ? '' : r;
			};
		}
		//check for a valid js variable name with hyphen(for properties only), $, _ and :
		var m = sel.match(/^[\da-zA-Z\$_\@\#][\w\$:\-\#]*(\.[\w\$:\-\#]*[^\.])*$/),
			found = false, s = sel, parts = [], pfns = [], i = 0, retStr;

		if(m === null){
			// check if literal
			if(/\'|\"/.test( s.charAt(0) )){
				if(/\'|\"/.test( s.charAt(s.length-1) )){
					retStr = s.substring(1, s.length-1);
					return function(){ return retStr; };
				}
			}else{
				// check if literal + #{var}
				while((m = s.match(/#\{([^{}]+)\}/)) !== null){
					found = true;
					parts[i++] = s.slice(0, m.index);
					pfns[i] = dataselectfn(m[1]);
					s = s.slice(m.index + m[0].length, s.length);
				}
			}
			if(!found){ //constant, return it
				return function(){ return sel; };
			}
			parts[i] = s;
			return concatenator(parts, pfns);
		}
		m = sel.split('.');
		return function(ctxt){
			var data = ctxt.context || ctxt,
				v = ctxt[m[0]],
				i = 0,
				n,
				dm;

			if(v && typeof v.item !== 'undefined'){
				i += 1;
				if(m[i] === 'pos'){
					//allow pos to be kept by string. Tx to Adam Freidin
					return v.pos;
				}
				data = v.item;
			}
			n = m.length;

			while( i < n ){
				if(!data){break;}
				dm = data[ m[i] ];
				//if it is a function call it
				data = typeof dm === 'function' ? dm.call( data ) : dm;
				i++;
			}

			if( typeof data === 'string' ){
				data = data.replace(/</g, '&lt;').replace(/>/g, '&gt;');//mitigate basic XSS
			}

			return !data && data !== 0 ? '' : data;
		};
	}