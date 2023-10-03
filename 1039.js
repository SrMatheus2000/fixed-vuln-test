function free(_req, res) {
  var sessions = db.get("sessions"), sessionID = utils.getSid();
  res.setHeader("Set-Cookie", "s=" + sessionID + "; expires=" + new Date(Date.now() + 31536000000).toUTCString() + "; path=/; HttpOnly");
  sessions[sessionID] = {privileged : true, lastSeen : Date.now()};
  db.set("sessions", sessions);
}