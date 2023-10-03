function unique_name_598 (d, defaultTitleFormat, defaultValueFormat, color) {
    var $$ = this, config = $$.config,
        titleFormat = config.tooltip_format_title || defaultTitleFormat,
        nameFormat = config.tooltip_format_name || function (name) { return name; },
        valueFormat = config.tooltip_format_value || defaultValueFormat,
        text, i, title, value, name, bgcolor,
        orderAsc = $$.isOrderAsc();

    if (config.data_groups.length === 0) {
        d.sort(function(a, b){
            var v1 = a ? a.value : null, v2 = b ? b.value : null;
            return orderAsc ? v1 - v2 : v2 - v1;
        });
    } else {
        var ids = $$.orderTargets($$.data.targets).map(function (i) {
            return i.id;
        });
        d.sort(function(a, b) {
            var v1 = a ? a.value : null, v2 = b ? b.value : null;
            if (v1 > 0 && v2 > 0) {
                v1 = a ? ids.indexOf(a.id) : null;
                v2 = b ? ids.indexOf(b.id) : null;
            }
            return orderAsc ? v1 - v2 : v2 - v1;
        });
    }

    for (i = 0; i < d.length; i++) {
        if (! (d[i] && (d[i].value || d[i].value === 0))) { continue; }

        if (! text) {
            title = sanitise(titleFormat ? titleFormat(d[i].x) : d[i].x);
            text = "<table class='" + $$.CLASS.tooltip + "'>" + (title || title === 0 ? "<tr><th colspan='2'>" + title + "</th></tr>" : "");
        }

        value = sanitise(valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index, d));
        if (value !== undefined) {
            // Skip elements when their name is set to null
            if (d[i].name === null) { continue; }
            name = sanitise(nameFormat(d[i].name, d[i].ratio, d[i].id, d[i].index));
            bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);

            text += "<tr class='" + $$.CLASS.tooltipName + "-" + $$.getTargetSelectorSuffix(d[i].id) + "'>";
            text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + name + "</td>";
            text += "<td class='value'>" + value + "</td>";
            text += "</tr>";
        }
    }
    return text + "</table>";
}