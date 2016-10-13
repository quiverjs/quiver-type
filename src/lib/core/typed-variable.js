import { assertType } from './assert'
import { TermVariable } from './variable'

import { Type } from '../type/type'

const $termVar = Symbol('@termVar')
const $type = Symbol('@type')

// type TypedVariable = Pair TermVariable Type
export class TypedVariable {
  constructor(termVar, type) {
    assertType(termVar, TermVariable)
    assertType(type, Type)

    this[$termVar] = termVar
    this[$type] = type
  }

  get termVar() {
    return this[$termVar]
  }

  get type() {
    return this[$type]
  }
}
