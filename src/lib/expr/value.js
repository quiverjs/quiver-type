import { Set } from '../core/container'
import { assertType } from '../core/assert'

import { LiteralType } from '../type/literal'

import { Expression } from './expression'

const $value = Symbol('@value')
const $type = Symbol('@type')

export class ValueExpression extends Expression {
  constructor(value, type) {
    assertType(type, LiteralType)
    type.typeCheckObject(value)

    super()

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
