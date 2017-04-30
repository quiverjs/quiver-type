import {
  assertKeyword,
  assertInstanceOf
} from '../core/assert'

import { CompiledType } from '../compiled/type'

const $termVar = Symbol('@termVar')
const $compiledType = Symbol('@compiledType')

// type ArgSpec = Pair Variable CompiledType
export class ArgSpec {
  constructor(termVar, compiledType) {
    assertKeyword(termVar)
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
