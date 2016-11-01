import { assertType } from '../core/assert'

import { CompiledType } from './type'
import { Type } from '../type/type'

const $typeChecker = Symbol('@typeChecker')

export class DynamicCompiledType extends CompiledType {
  constructor(srcType, typeChecker) {
    assertType(srcType, Type)

    super(srcType)

    this[$typeChecker] = typeChecker
  }

  get typeChecker() {
    return this[$typeChecker]
  }

  typeCheck(object) {
    return this.typeChecker(object)
  }
}
