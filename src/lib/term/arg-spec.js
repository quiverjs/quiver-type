import { assertInstanceOf } from '../core/assert'
import { TermVariable } from '../core/variable'

import { CompiledType } from '../compiled/type'

const $termVar = Symbol('@termVar')
const $compiledType = Symbol('@compiledType')

// type ArgSpec = Pair TermVariable CompiledType
export class ArgSpec {
  constructor(termVar, compiledType) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(compiledType, CompiledType)

    this[$termVar] = termVar
    this[$compiledType] = compiledType
  }

  get termVar() {
    return this[$termVar]
  }

  get compiledType() {
    return this[$compiledType]
  }
}
