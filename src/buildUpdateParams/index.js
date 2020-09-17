import { input } from '../marshall/index.js'

const seedIncrement = 1 / 62
let identifierSeed = seedIncrement

function mapToObject (processMap) {
  const returnObject = {}
  for (const [key, value] of processMap) {
    returnObject[key] = value
  }
  return returnObject
}

const randomString = stringLength => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'
  let randomstring = ''
  for (let i = 0; i < stringLength; i++) {
    const rnum = Math.floor(Math.random() * chars.length)
    randomstring += chars.substring(rnum, rnum + 1)
  }
  return randomstring
}

const identifierString = stringLength => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'
  let randomstring = ''

  for (let i = 1; i <= stringLength; i++) {
    const seedModifier = identifierSeed * i - Math.trunc(identifierSeed * i)
    const rnum = Math.floor(seedModifier * chars.length)
    randomstring += chars.substring(rnum, rnum + 1)
  }

  identifierSeed += seedIncrement

  return randomstring
}

const buildUpdateExpression = (
  item,
  parent,
  expressionMap,
  attributeNameObj
) => {
  for (const index in item) {
    if (typeof item[index] === 'object') {
      if (Array.isArray(item[index])) {
        const tempArray = item[index]
        // console.log(tempArray)
        const identifier = `#${identifierString(4)}`
        // attributeNameObj[identifier] = index
        for (let i = 0; i < tempArray.length; i++) {
          const indexIdentifier = `${identifier}[${i}]`
          attributeNameObj[identifier] = index
          const key = parent
            ? `${parent}.${indexIdentifier}`
            : `${indexIdentifier}`
          if (typeof tempArray[i] === 'object') {
            buildUpdateExpression(
              tempArray[i],
              key,
              expressionMap,
              attributeNameObj
            )
          } else {
            expressionMap.set(key, tempArray[i])
          }
        }
      } else {
        const identifier = `#${identifierString(4)}`
        attributeNameObj[identifier] = index
        const key = parent ? `${parent}.${identifier}` : identifier
        buildUpdateExpression(item[index], key, expressionMap, attributeNameObj)
      }
    } else {
      const identifier = `#${identifierString(4)}`
      attributeNameObj[identifier] = index
      const key = parent ? `${parent}.${identifier}` : identifier
      expressionMap.set(key, item[index])
    }
  }
}

const buildUpdateParams = item => {
  const returnMap = new Map()
  const returnObj = {}

  buildUpdateExpression(item, null, returnMap, returnObj)

  let strUpdateExpression = 'SET'
  const mapExpressionAttributeValues = new Map()

  for (const [key, value] of returnMap.entries()) {
    const variableidentifier = identifierString(5)
    strUpdateExpression += ` ${key} = :${variableidentifier},`
    mapExpressionAttributeValues.set(`:${variableidentifier}`, input(value))
  }

  return {
    UpdateExpression: strUpdateExpression.slice(
      0,
      strUpdateExpression.length - 1
    ),
    ExpressionAttributeNames: returnObj,
    ExpressionAttributeValues: mapToObject(mapExpressionAttributeValues)
  }
}

export default buildUpdateParams
