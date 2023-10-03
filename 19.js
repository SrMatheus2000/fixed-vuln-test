function unique_name_5 (port) {
  var processId = null
  try {
    processId = exec(`lsof -t -i:${parseInt(port, 10)}`)
  } catch (e) {

  }

  if (processId !== null) { // if exists kill
    exec(`kill ${processId}`)
  }
}