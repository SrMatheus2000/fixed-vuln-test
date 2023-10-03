function unique_name_468(colorTheme) {
      var sanitiz = require("eval-sanitizer");
      sanitiz.setPolicy(sanitiz.ONLY_LITERALS_AND_IDENTIFIERS);
      for(var i in colorTheme){
        // console.log('i', i);
        var theme = "";
        if(typeof colorTheme[i] === 'string'){
          theme = '"'+colorTheme[i] + '"';	  
          eval(sanitiz`colors.setTheme({${i} : ${theme}});`);
        }else{
          var v = "";
          var aryVal = (colorTheme[i]).toString().split(',');
          for (var x=0; x < aryVal.length; x++){
            if(x > 0) v += ',';
            v += '"' + aryVal[x] + '"';
          }
          eval(sanitiz`theme = {${i} : [${v}]}`);
          colors.setTheme(theme);
        }
      }
    }