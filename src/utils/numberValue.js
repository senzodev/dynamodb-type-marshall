class NumberValue {
  constructor (value) {
    this.wrapperName = 'NumberValue'
    this.value = value.toString()
  }

  toJSON () {
    return this.toNumber()
  }

  toNumber () {
    return Number(this.value)
  }

  toString () {
    return this.value
  }
}

export { NumberValue }
