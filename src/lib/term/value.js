import { ISet } from '../core/container'
import { assertInstanceOf, assertNoError } from '../core/assert'

import { Type } from '../type/type'

import { Term } from './term'

const $value = Symbol('@value')
const $type = Symbol('@type')

const constantFunc = value =>
  () => value

export class ValueTerm extends Term {
  constructor(value, type) {
    assertInstanceOf(type, Type)
    assertNoError(type.compileType().typeCheck(value))

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
    return ISet()
  }

  termType() {
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

  formatTerm() {
    const { value } = this

    return ['value', value]
  }
}
