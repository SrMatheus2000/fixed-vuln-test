function unique_name_108(e, a) {
    var d = document,
        el = d.createElement(e);
    if (a && "[object Object]" === Object.prototype.toString.call(a)) {
      var i;
      for (i in a)
        if (i in el) el[i] = a[i];
        else if ("html" === i) el.textContent = a[i];
        else if ("text" === i) {
          var t = d.createTextNode(a[i]);
          el.appendChild(t);
        } else el.setAttribute(i, a[i]);
    }
    return el;
  }