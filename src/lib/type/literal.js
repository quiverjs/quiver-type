import { assertType, assertFunction } from '../core/assert'

import { typeKind } from '../kind/type'

import { Type } from './type'

const $typeChecker = Symbol('@typeChecker')

export class LiteralType extends Type {
  // constructor :: (Any -> Bool) -> Exception
  constructor(typeChecker) {
    assertFunction(typeChecker)

    super()

    this[$typeChecker] = typeChecker
  }

  get typeChecker() {
    return this[$typeChecker]
  }

  freeTypeVariables() {
    return Set()
  }

  typeCheck(type) {
    assertType(type, Type)

    assertType(type, LiteralType,
      'target type must be ConstantType')

    if(type.typeChecker !== this.typeChecker)
      throw new TypeError('target type is different constant type')
  }

  bindType(typeVar, type) {
    return this
  }

  typeKind() {
    return typeKind
  }

  isTerminal() {
    return true
  }

  typeCheckObject(object) {
    return this.typeChecker(object)
  }
}
