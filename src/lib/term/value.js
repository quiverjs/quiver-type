import { ISet } from '../core/container'
import {
  assertNoError,
  assertFunction,
  assertInstanceOf,
  assertListContent
} from '../core/assert'

import { Type } from '../type/type'

import { Term } from './term'
import { ArgSpec } from './arg-spec'

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

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!(targetTerm instanceof ValueTerm))
      return new TypeError('target term must be ValueTerm')

    const { value, type } = this

    const err = type.typeCheck(targetTerm.type)
    if(err) return err

    if(value !== targetTerm.value)
      return new TypeError('value mismatch in value term')
  }

  *subTerms() {
    // empty
  }

  *subTypes() {
    // empty
  }

  map(termMapper, typeMapper) {
    assertFunction(termMapper)
    assertFunction(typeMapper)

    return this
  }

  evaluate() {
    return this
  }

  compileClosure(closureSpecs) {
    assertListContent(closureSpecs, ArgSpec)

    return constantFunc(this.value)
  }

  formatTerm() {
    const { value } = this

    return ['value', value]
  }
}

export const value = (value, type) => {
  return new ValueTerm(value, type)
}
