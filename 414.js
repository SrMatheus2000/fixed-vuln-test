function convertToSVG(_str) {
    var htmlEntitiesDecoded = Plotly.util.html_entity_decode(_str);
    var result = htmlEntitiesDecoded
        .split(/(<[^<>]*>)/).map(function(d) {
            var match = d.match(/<(\/?)([^ >]*)\s*(.*)>/i),
                tag = match && match[2].toLowerCase(),
                style = TAG_STYLES[tag];

            if(style !== undefined) {
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
                if(tag === 'a') {
                    if(close) return '</a>';
                    else if(extra.substr(0,4).toLowerCase() !== 'href') return '<a>';
                    else {
                        // remove quotes, leading '=', replace '&' with '&amp;'
                        var href = extra.substr(4)
                            .replace(/["']/g, '')
                            .replace(/=/, '')
                            .replace(/&/g, '&amp;');

                        // check protocol
                        var dummyAnchor = document.createElement('a');
                        dummyAnchor.href = href;
                        if(PROTOCOLS.indexOf(dummyAnchor.protocol) === -1) return '<a>';

                        return '<a xlink:show="new" xlink:href="' + href + '">';
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
            else {
                return Plotly.util.xml_entity_encode(d).replace(/</g, '&lt;');
            }
        });

    var indices = [];
    for(var index = result.indexOf('<br>'); index > 0; index = result.indexOf('<br>', index+1)) {
        indices.push(index);
    }
    var count = 0;
    indices.forEach(function(d) {
        var brIndex = d + count;
        var search = result.slice(0, brIndex);
        var previousOpenTag = '';
        for(var i2=search.length-1; i2>=0; i2--) {
            var isTag = search[i2].match(/<(\/?).*>/i);
            if(isTag && search[i2] !== '<br>') {
                if(!isTag[1]) previousOpenTag = search[i2];
                break;
            }
        }
        if(previousOpenTag) {
            result.splice(brIndex+1, 0, previousOpenTag);
            result.splice(brIndex, 0, '</tspan>');
            count += 2;
        }
    });

    var joined = result.join('');
    var splitted = joined.split(/<br>/gi);
    if(splitted.length > 1) {
        result = splitted.map(function(d, i) {
            // TODO: figure out max font size of this line and alter dy
            // this requires either:
            // 1) bringing the base font size into convertToTspans, or
            // 2) only allowing relative percentage font sizes.
            // I think #2 is the way to go
            return '<tspan class="line" dy="' + (i*1.3) + 'em">'+ d +'</tspan>';
        });
    }

    return result.join('');
}