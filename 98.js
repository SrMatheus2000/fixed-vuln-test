function unique_name_47 (data, val, src) {
			var a = _fnSplitObjNotation( src ), b;
			var aLast = a[a.length-1];
			var arrayNotation, funcNotation, o, innerSrc;

			for ( var i=0, iLen=a.length-1 ; i<iLen ; i++ )
			{
				// Protect against prototype pollution
				if (a[i] === '__proto__' || a[i] === 'constructor') {
					throw new Error('Cannot set prototype values');
				}

				// Check if we are dealing with an array notation request
				arrayNotation = a[i].match(__reArray);
				funcNotation = a[i].match(__reFn);

				if ( arrayNotation )
				{
					a[i] = a[i].replace(__reArray, '');
					data[ a[i] ] = [];

					// Get the remainder of the nested object to set so we can recurse
					b = a.slice();
					b.splice( 0, i+1 );
					innerSrc = b.join('.');

					// Traverse each entry in the array setting the properties requested
					if ( Array.isArray( val ) )
					{
						for ( var j=0, jLen=val.length ; j<jLen ; j++ )
						{
							o = {};
							setData( o, val[j], innerSrc );
							data[ a[i] ].push( o );
						}
					}
					else
					{
						// We've been asked to save data to an array, but it
						// isn't array data to be saved. Best that can be done
						// is to just save the value.
						data[ a[i] ] = val;
					}

					// The inner call to setData has already traversed through the remainder
					// of the source and has set the data, thus we can exit here
					return;
				}
				else if ( funcNotation )
				{
					// Function call
					a[i] = a[i].replace(__reFn, '');
					data = data[ a[i] ]( val );
				}

				// If the nested object doesn't currently exist - since we are
				// trying to set the value - create it
				if ( data[ a[i] ] === null || data[ a[i] ] === undefined )
				{
					data[ a[i] ] = {};
				}
				data = data[ a[i] ];
			}

			// Last item in the input - i.e, the actual set
			if ( aLast.match(__reFn ) )
			{
				// Function call
				data = data[ aLast.replace(__reFn, '') ]( val );
			}
			else
			{
				// If array notation is used, we just want to strip it and use the property name
				// and assign the value. If it isn't used, then we get the result we want anyway
				data[ aLast.replace(__reArray, '') ] = val;
			}
		}