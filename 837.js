function unique_name_463 (con) {
  var data = '';
  con.on('data', function (chunk) {
    data += chunk;
  });
  con.on('end', function () {
    if (!data) {
      con.end();
      return;
    }
    var p = data.indexOf(' ');
    if (p === -1 || data.substring(0, p) !== token) {
      con.end();
      return;
    }
    data = data.substring(p + 1);
    if (data === 'stop') {
      con.end();
      server.close();
      return;
    }
    var cwd, args, text;
    if (data.substring(0, 1) === '{') {
      var json = JSON.parse(data);
      cwd = json.cwd;
      args = json.args;
      text = json.text;
    } else {
      var parts = data.split(' ');
      cwd = parts[0];
      args = parts.slice(1);
    }
    try {
      con.write(linter(cwd, args, text));
    } catch (e) {
      con.write(e.toString() + '\n');
    }
    con.end();
  });
}