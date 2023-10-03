function unique_name_639 (attr) {
      var CLASS = []; if (this["class"]) {CLASS.push(this["class"])}
      if (this.isa(MML.TeXAtom) && SETTINGS.texHints) {
        var TEXCLASS = ["ORD","OP","BIN","REL","OPEN","CLOSE","PUNCT","INNER","VCENTER"][this.texClass];
        if (TEXCLASS) {
          CLASS.push("MJX-TeXAtom-"+TEXCLASS)
          if (TEXCLASS === "OP" && !this.movablelimits) CLASS.push("MJX-fixedlimits");
        }
      }
      if (this.mathvariant && this.toMathMLvariants[this.mathvariant])
        {CLASS.push("MJX"+this.mathvariant)}
      if (this.variantForm) {CLASS.push("MJX-variant")}
      if (CLASS.length) {attr.unshift('class="'+this.toMathMLquote(CLASS.join(" "))+'"')}
    }