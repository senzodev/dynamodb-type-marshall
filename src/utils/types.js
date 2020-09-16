import { typeName, isType } from './util.js'
import stream from 'stream'

function typeOf (data) {
  if (data === null && typeof data === 'object') {
    return 'null'
  } else if (data !== undefined && isBinary(data)) {
    return 'Binary'
  } else if (data !== undefined && data.constructor) {
    return data.wrapperName || typeName(data.constructor)
  } else if (data !== undefined && typeof data === 'object') {
    // this object is the result of Object.create(null), hence the absence of a
    // defined constructor
    return 'Object'
  } else {
    return 'undefined'
  }
}

const isReadableStream = obj => {
  return (
    obj instanceof stream.Stream &&
    typeof (obj._read === 'function') &&
    typeof (obj._readableState === 'object')
  )
}

function isBinary (data) {
  const types = [
    'Buffer',
    'File',
    'Blob',
    'ArrayBuffer',
    'DataView',
    'Int8Array',
    'Uint8Array',
    'Uint8ClampedArray',
    'Int16Array',
    'Uint16Array',
    'Int32Array',
    'Uint32Array',
    'Float32Array',
    'Float64Array'
  ]

  if (Buffer.isBuffer(data)) {
    return true
  }

  if (isReadableStream(data)) {
    return true
  }

  for (let i = 0; i < types.length; i++) {
    if (data !== undefined && data.constructor) {
      if (isType(data, types[i])) return true
      if (typeName(data.constructor) === types[i]) return true
    }
  }

  return false
}

export { typeOf, isBinary }
