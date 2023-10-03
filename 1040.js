function create(_req, res, postData) {
  var sessions = db.get("sessions"), sessionID = utils.getSid();
  if (postData.remember) // semi-permanent cookie
    res.setHeader("Set-Cookie", "s=" + sessionID + "; expires=" + new Date(Date.now() + 31536000000).toUTCString() + "; path=/; HttpOnly");
  else // single-session cookie
    res.setHeader("Set-Cookie", "s=" + sessionID + "; path=/; HttpOnly");
  sessions[sessionID] = {privileged : db.get("users")[postData.username].privileged, lastSeen : Date.now()};
  db.set("sessions", sessions);
}