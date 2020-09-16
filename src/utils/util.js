const isType = (obj, type) => {
  // handle cross-"frame" objects
  if (typeof type === 'function') type = typeName(type)
  return Object.prototype.toString.call(obj) === '[object ' + type + ']'
}

const typeName = type => {
  if (Object.prototype.hasOwnProperty.call(type, 'name')) return type.name
  const str = type.toString()
  const match = str.match(/^\s*function (.+)\(/)
  return match ? match[1] : str
}

export { isType, typeName }
