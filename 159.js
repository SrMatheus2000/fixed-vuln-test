function ffmpeg(os) {
  var stdio = os.stdio===undefined? STDIO:os.stdio;
  var {file, args} = command(os);
  return new Promise((fres, frej) => cp.execFile(file, args, {stdio}, (err, stdout, stderr) => {
    if(err) frej(err);
    else fres({stdout, stderr});
  }));
}