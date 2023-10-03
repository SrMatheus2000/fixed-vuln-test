function unique_name_406(Item, validFieldsForType, allowDateOverride) {
        if ("string" !== typeof Item.note) return;
        var elems = [];
        var lines = Item.note.split('\n');
        var lastline = "";
        // Normalize entries
        for (var i=0, ilen=lines.length; i<ilen; i++) {
            var line = lines[i];
            var elems = [];
            var m = line.match(CSL.NOTE_FIELDS_REGEXP);
            if (m) {
                var splt = line.split(CSL.NOTE_FIELDS_REGEXP);
                for (var j=0,jlen=(splt.length-1);j<jlen;j++) {
                    elems.push(splt[j]);
                    elems.push(m[j]);
                }
                elems.push(splt[splt.length-1])
                for (var j=1,jlen=elems.length;j<jlen;j += 2) {
                    // Abort conversions if preceded by unparseable text
                    if (elems[j-1].trim() && (i>0 || j>1) && !elems[j-1].match(CSL.NOTE_FIELD_REGEXP)) {
                        break
                    } else {
                        elems[j] = '\n' + elems[j].slice(2,-1).trim() + '\n';
                    }
                }
                lines[i] = elems.join('');
            }
        }
        // Resplit
        lines = lines.join('\n').split('\n');
        var offset = 0;
        var names = {};
        for (var i=0,ilen=lines.length;i<ilen;i++) {
            var line = lines[i];
            var mm = line.match(CSL.NOTE_FIELD_REGEXP);
            if (!line.trim()) {
                continue;
            } else if (!mm) {
                if (i === 0) {
                    continue;
                } else {
                    offset = i;
                    break;
                }
            }
            var key = mm[1];
            var val = mm[2].replace(/^\s+/, "").replace(/\s+$/, "");
            if (key === "type") {
                Item.type = val;
                lines[i] = "";
            } else if (CSL.DATE_VARIABLES.indexOf(key) > -1) {
                if (allowDateOverride) {
                    Item[key] = {raw: val};
                    if (!validFieldsForType || (validFieldsForType[key] && isDateString(val))) {
                        lines[i] = "";
                    }
                }
            } else if (!Item[key]) {
                if (CSL.NAME_VARIABLES.indexOf(key) > -1) {
                    if (!names[key]) {
                        names[key] = [];
                    }
                    var lst = val.split(/\s*\|\|\s*/);
                    if (lst.length === 1) {
                        names[key].push({literal:lst[0]});
                    } else if (lst.length === 2) {
                        var name = {family:lst[0],given:lst[1]};
                        CSL.parseParticles(name);
                        names[key].push(name);
                    }
                } else {
                    Item[key] = val;
                }
                if (!validFieldsForType || validFieldsForType[key]) {
                    lines[i] = "";
                }
            }
        }
        for (var key in names) {
            Item[key] = names[key];
        }
        // Final cleanup for validCslFields only: eliminate blank lines, add blank line to text
        if (validFieldsForType) {
            if (lines[offset].trim()) {
                lines[offset] = '\n' + lines[offset]
            }
            for (var i=offset-1;i>-1;i--) {
                if (!lines[i].trim()) {
                    lines = lines.slice(0, i).concat(lines.slice(i + 1));
                }
            }
        }
        Item.note = lines.join("\n").trim();
    }