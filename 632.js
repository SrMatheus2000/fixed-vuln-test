function unique_name_347(imagePaths) {
    var pdfImage = this;
    var combineCommand = pdfImage.constructCombineCommandForFile(imagePaths);
    return new Promise(function (resolve, reject) {
      spawn(combineCommand.cmd, combineCommand.args, { capture: [ 'stdout', 'stderr' ]})
        .then(function () {
          spawn("rm", imagePaths); //cleanUp
          resolve(pdfImage.getOutputImagePathForFile());
        }).catch(function(error){
          reject({
            message: "Failed to combine images",
            error: error.message,
            stdout: error.stdout,
            stderr: error.stderr
          });
      });
    });
  }