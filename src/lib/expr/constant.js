
export const ConstantExpression = ExpressionClass(
class extends Expression {
  constructor(value, type) {
    assertType(type, ConstantType)

    this[$value] = value
    this[$type] = type
  }

  get value() {
    return this[$value]
  }

  get type() {
    return this[$type]
  }

  freeTermVariables() {
    return Set()
  }

  freeTypeVariables() {
    return Set()
  }

  getType(env) {
    return this.type
  }

  bindTerm() {
    return this
  }

  bindType() {
    return this
  }

  reduce() {
    return this
  }

  evaluate() {
    return this.value
  }

  isTerminal() {
    return true
  }
})
