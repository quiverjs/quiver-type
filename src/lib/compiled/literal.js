import { assertType } from '../core/assert'

import { CompiledType } from './type'
import { LiteralType } from '../type/literal'

const $typeChecker = Symbol('@typeChecker')

export class CompiledLiteralType extends CompiledType {
  constructor(srcType) {
    assertType(srcType, LiteralType)

    const { typeChecker } = srcType

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
