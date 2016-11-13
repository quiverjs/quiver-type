import { assertType } from '../core/assert'
import { TermVariable } from '../core/variable'

import { CompiledType } from '../compiled-type/type'

const $termVar = Symbol('@termVar')
const $compiledType = Symbol('@compiledType')

// type ArgSpec = Pair TermVariable CompiledType
export class ArgSpec {
  constructor(termVar, compiledType) {
    assertType(termVar, TermVariable)
    assertType(compiledType, CompiledType)

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
