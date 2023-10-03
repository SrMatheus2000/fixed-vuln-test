function unique_name_48(data){
    if(typeof data != 'string'){
        if(typeof data.toString === 'function'){
            data = data.toString();
        } else {
            throw new Error('expecting string but got '+typeof data);
        }
    }
    var protectedKeys = ['__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__', '__proto__'];
    var result = {};
    var currentSection = undefined;
    var lines = data.split(this.options.lineEnding);
    for(var i = 0; i < lines.length; i++){
        var line = lines[i];
        if(this.options.trimLines === true){
            line = line.trim();
        }
        if(line.length == 0 || stringBeginsWithOnOfTheseStrings(line,this.options.commentIdentifiers)){
            continue;
        }
        
        var sectionRegExp = new RegExp("^\\"+this.options.sectionOpenIdentifier+"(.*?)\\"+this.options.sectionCloseIdentifier+"$");
        var newSection = line.match(sectionRegExp);
        if(newSection !== null){
            currentSection = newSection[1];
            if(typeof result[currentSection] === 'undefined' && !protectedKeys.includes(currentSection)){
                result[currentSection] = {};
            }
            continue;
        }

        var assignPosition = line.indexOf(this.options.assignIdentifier);
        var key = undefined;
        var value = undefined;
        if(assignPosition === -1){
            key = line;
            value = this.options.defaultValue;
        } else {
            var assignIdentifierLength = this.options.assignIdentifier.length
            if (this.options.ignoreMultipleAssignIdentifier) {
                var regExp = new RegExp(escapeRegExp(this.options.assignIdentifier) + '+')
                var matchResult = line.match(regExp)
                if (matchResult !== null) {
                    assignIdentifierLength = matchResult[0].length
                }
            }
            key = line.substr(0,assignPosition);
            value = line.substr(assignPosition+assignIdentifierLength);
        }
        if (typeof this.options.valueIdentifier === 'string') {
            value = this.valueTrim(value, this.options.valueIdentifier);
        }
        if (protectedKeys.includes(currentSection) || protectedKeys.includes(key)) {
            continue;
        }
        if(typeof currentSection === 'undefined'){
            result[key] = value;
        } else {
            result[currentSection][key] = value;
        }
    }
    return result;
}