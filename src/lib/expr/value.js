import { Set } from '../core/container'
import { assertType, assertNoError } from '../core/assert'

import { LiteralType } from '../type/literal'

import { Expression } from './expression'

const $value = Symbol('@value')
const $type = Symbol('@type')

const constantFunc = value =>
  () => value

export class ValueExpression extends Expression {
  constructor(value, type) {
    assertType(type, LiteralType)
    assertNoError(type.typeCheckObject(value))

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

  exprType() {
    return this.type
  }

  validateVarType(termVar, type) {
    // no op
  }

  validateTVarKind(typeVar, kind) {
    // no op
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

  compileBody(argSpecs) {
    return constantFunc(this.value)
  }

  isTerminal() {
    return true
  }
}
