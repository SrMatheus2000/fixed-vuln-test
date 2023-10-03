function unique_name_500(d){
            var match = d.match(/<(\/?)([^ >]*)\s*(.*)>/i),
                tag = match && match[2].toLowerCase(),
                style = TAG_STYLES[tag];
            if(style !== undefined){
                var close = match[1],
                    extra = match[3],
                    /**
                     * extraStyle: any random extra css (that's supported by svg)
                     * use this like <span style="font-family:Arial"> to change font in the middle
                     *
                     * at one point we supported <font family="..." size="..."> but as this isn't even
                     * valid HTML anymore and we dropped it accidentally for many months, we will not
                     * resurrect it.
                     */
                    extraStyle = extra.match(/^style\s*=\s*"([^"]+)"\s*/i);
                // anchor and br are the only ones that don't turn into a tspan
                if(tag === 'a'){
                    if(close) return '</a>';
                    else if(extra.substr(0,4).toLowerCase() !== 'href') return '<a>';
                    else {
                        var dummyAnchor = document.createElement('a');
                        dummyAnchor.href = extra.split('href=')[1].replace(/["']/g, '');

                        if(PROTOCOLS.indexOf(dummyAnchor.protocol) === -1) return '<a>';

                        return '<a xlink:show="new" xlink:href' + extra.substr(4) + '>';
                    }
                }
                else if(tag === 'br') return '<br>';
                else if(close) {
                    // closing tag

                    // sub/sup: extra tspan with zero-width space to get back to the right baseline
                    if(tag === 'sup') return '</tspan><tspan dy="0.42em">&#x200b;</tspan>';
                    if(tag === 'sub') return '</tspan><tspan dy="-0.21em">&#x200b;</tspan>';
                    else return '</tspan>';
                }
                else {
                    var tspanStart = '<tspan';

                    if(tag === 'sup' || tag === 'sub') {
                        // sub/sup: extra zero-width space, fixes problem if new line starts with sub/sup
                        tspanStart = '&#x200b;' + tspanStart;
                    }

                    if(extraStyle) {
                        // most of the svg css users will care about is just like html,
                        // but font color is different. Let our users ignore this.
                        extraStyle = extraStyle[1].replace(/(^|;)\s*color:/, '$1 fill:');
                        style = (style ? style + ';' : '') + extraStyle;
                    }

                    return tspanStart + (style ? ' style="' + style + '"' : '') + '>';
                }
            }
            else{
                return Plotly.util.xml_entity_encode(d).replace(/</g, '&lt;');
            }
        }