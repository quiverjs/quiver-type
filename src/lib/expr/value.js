import { assertType } from '../core/assert'

import { ConstantType } from '../type/constant'

import { Expression } from './expression'

const $value = Symbol('@value')
const $type = Symbol('@type')

export class ValueExpression extends Expression {
  constructor(value, type) {
    assertType(type, ConstantType)
    type.checkInstance(value)

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

  exprType(env) {
    return this.type
  }

  bindTerm() {
    return this
  }

  bindType() {
    return this
  }

  evaluate() {
    return this
  }

  isTerminal() {
    return true
  }
}
