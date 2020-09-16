import { DynamoDBSet } from '../utils/set.js'
import { NumberValue } from '../utils/numberValue.js'

const output = (data, options) => {
  options = options || {}
  let list
  let map

  for (let type in data) {
    const values = data[type]
    if (type === 'M') {
      map = {}
      for (let key in values) {
        map[key] = output(values[key], options)
      }

      return map
    } else if (type === 'L') {
      list = []
      for (let i = 0; i < values.length; i++) {
        list.push(output(values[i], options))
      }
      return list
    } else if (type === 'SS') {
      list = []
      for (let i = 0; i < values.length; i++) {
        list.push(values[i] + '')
      }
      return new DynamoDBSet(list)
    } else if (type === 'NS') {
      list = []
      for (let i = 0; i < values.length; i++) {
        list.push(convertNumber(values[i], options.wrapNumbers))
      }
      return new DynamoDBSet(list)
    } else if (type === 'BS') {
      list = []
      for (let i = 0; i < values.length; i++) {
        list.push(Buffer.from(values[i]))
      }
      return new DynamoDBSet(list)
    } else if (type === 'S') {
      return values + ''
    } else if (type === 'N') {
      return convertNumber(values, options.wrapNumbers)
    } else if (type === 'B') {
      return Buffer.from(values)
    } else if (type === 'BOOL') {
      return values === 'true' || values === 'TRUE' || values === true
    } else if (type === 'NULL') {
      return null
    }
  }
}

const unmarshall = (data, options) => {
  let response

  const v3 = options ? (options.v3 ? options.v3 : false) : false

  if (v3) {
    if (Array.isArray(data)) {
      response = output({ L: convertArray(data) }, options)
    } else {
      response = output({ M: convertObject(data) }, options)
    }
  } else {
    if (Array.isArray(data)) {
      response = output({ L: data }, options)
    } else {
      response = output({ M: data }, options)
    }
  }
  return response
}

const convertArray = data => {
  const list = []
  for (let i = 0; i < data.length; i++) {
    if (Array.isArray(data[i])) {
      list.push({ L: convertArray(data[i]) })
    } else {
      list.push({ M: convertObject(data[i]) })
    }
  }

  return list
}

const convertObject = data => {
  const map = {}
  for (const key in data) {
    const value = data[key]
    if (data.hasOwnProperty(key)) {
      let rootValue = {}
      const rootKey = key
      for (const childKey in value) {
        const childValue = value[childKey]

        if (childKey !== '__type') {
          if (typeof childValue !== 'undefined') {
            if (childKey === 'L') {
              convertArray(childValue)
            } else if (childKey === 'M') {
              convertObject(childValue)
            } else {
              rootValue[childKey] = childValue
              map[rootKey] = rootValue
            }
          }
        }
      }
    }
  }
  return map
}

function convertNumber (value, wrapNumbers) {
  return wrapNumbers ? new NumberValue(value) : Number(value)
}




export { output, unmarshall }
