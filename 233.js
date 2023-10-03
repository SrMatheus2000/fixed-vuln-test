function unique_name_115 (files, message, newVer, tagName, callback) {
  message = escapeQuotes(message.replace("%s", newVer));
  files = files.map(escapeQuotes).join(" ");
  var functionSeries = [
    function (done) {
      cp.exec(gitApp + " add " + files, gitExtra, done);
    },

    function (done) {
      cp.exec([gitApp, "commit", "-m", message].join(" "), gitExtra, done);
    },

    function (done) {
      cp.exec(
        [gitApp, "tag", "-a", tagName, "-m", message].join(" "),
        gitExtra,
        done
      );
    },
  ];
  contra.series(functionSeries, callback);
}