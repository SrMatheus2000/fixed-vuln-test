function reducer(result, arg)
{
  arg = arg.split('=')

  // Get key node
  const keypath = arg.shift().split('.')

  // Get value
  let val = true
  if(arg.length)
  {
    val = arg.join('=').split(',')
    if(val.length === 1) val = val[0]
  }

  let key = keypath.shift()

  if(!keypath.length) return {...result, [key]: val}

  if(!result.hasOwnProperty(key)) result = {...result, [key]: {}}

  let newKey
  let newNode
  let node = result

  while(true)
  {
    newKey = keypath.shift()
    newNode = node[key]

    if(!keypath.length) break

    node = node[key] = {...newNode, [newKey]: newNode[newKey] || {}}
    key = newKey
  }

  // Store value
  node[key] = {...newNode, [newKey]: val}

  return result
}