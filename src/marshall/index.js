import { typeOf } from '../utils/types.js'

const formatMap = (data, options) => {
  const map = { M: {} }
  for (let key in data) {
    const formatted = input(data[key], options)
    if (formatted !== void 0) {
      map['M'][key] = formatted
    }
  }
  return map
}

const formatSet = (data, options) => {
  options = options || {}
  let values = data.values
  if (options.convertEmptyValues) {
    values = filterEmptySetValues(data)
    if (values.length === 0) {
      return input(null)
    }
  }

  const map = {}
  switch (data.type) {
    case 'String':
      map['SS'] = values
      break
    case 'Binary':
      map['BS'] = values
      break
    case 'Number':
      map['NS'] = values.map(function (value) {
        return value.toString()
      })
  }
  return map
}

function formatList (data, options) {
  const list = { L: [] }
  for (let i = 0; i < data.length; i++) {
    list['L'].push(input(data[i], options))
  }
  return list
}

const filterEmptySetValues = set => {
  const nonEmptyValues = []
  const potentiallyEmptyTypes = {
    String: true,
    Binary: true,
    Number: false
  }
  if (potentiallyEmptyTypes[set.type]) {
    for (let i = 0; i < set.values.length; i++) {
      if (set.values[i].length === 0) {
        continue
      }
      nonEmptyValues.push(set.values[i])
    }

    return nonEmptyValues
  }

  return set.values
}

const input = (data, options) => {
  options = options || {}
  const type = typeOf(data)
  if (type === 'Object') {
    return formatMap(data, options)
  } else if (type === 'Array') {
    return formatList(data, options)
  } else if (type === 'Set') {
    return formatSet(data, options)
  } else if (type === 'String') {
    if (data.length === 0 && options.convertEmptyValues) {
      return input(null)
    }
    return { S: data }
  } else if (type === 'Number' || type === 'NumberValue') {
    return { N: data.toString() }
  } else if (type === 'Binary') {
    if (data.length === 0 && options.convertEmptyValues) {
      return input(null)
    }
    return { B: data }
  } else if (type === 'Boolean') {
    return { BOOL: data }
  } else if (type === 'null') {
    return { NULL: true }
  } else if (type !== 'undefined' && type !== 'Function') {
    // this value has a custom constructor
    return formatMap(data, options)
  }
}

const marshall = (data, options) => {
  return input(data, options).M
}

export { input, marshall }
