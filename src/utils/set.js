import { typeOf } from './types.js'

const memberTypeToSetType = {
  String: 'String',
  Number: 'Number',
  NumberValue: 'Number',
  Binary: 'Binary'
}

class DynamoDBSet {
  constructor (list, options) {
    options = options || {}
    this.wrapperName = 'Set'
    this.initialize(list, options.validate)
  }

  initialize (list, validate) {
    var self = this
    self.values = [].concat(list)
    self.detectType()
    if (validate) {
      self.validate()
    }
  }

  detectType () {
    this.type = memberTypeToSetType[typeOf(this.values[0])]
    if (!this.type) {
      throw new Error({
        name: 'InvalidSetType',
        message: 'Sets can contain string, number, or binary values'
      })
    }
  }

  validate () {
    const self = this
    const length = self.values.length
    const values = self.values
    for (let i = 0; i < length; i++) {
      if (memberTypeToSetType[typeOf(values[i])] !== self.type) {
        throw new Error({
          name: 'InvalidType',
          message: self.type + ' Set contains ' + typeOf(values[i]) + ' value'
        })
      }
    }
  }

  toJSON () {
    const self = this
    return self.values
  }
}

export { DynamoDBSet }
