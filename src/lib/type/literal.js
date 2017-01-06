import { ISet } from '../core/container'
import { assertInstanceOf, assertFunction, assertString } from '../core/assert'

import { unitKind } from '../kind/unit'
import { DynamicCompiledType } from '../compiled-type/dynamic'

import { Type } from './type'

const $name = Symbol('@name')
const $typeChecker = Symbol('@typeChecker')

export class LiteralType extends Type {
  // constructor :: (Any -> Bool) -> Exception
  constructor(name, typeChecker) {
    assertString(name)
    assertFunction(typeChecker)

    super()

    this[$name] = name
    this[$typeChecker] = typeChecker
  }

  get typeName() {
    return this[$name]
  }

  get typeChecker() {
    return this[$typeChecker]
  }

  freeTypeVariables() {
    return ISet()
  }

  typeCheck(targetType) {
    assertInstanceOf(targetType, Type)

    if(targetType === this) return null

    if(!(targetType instanceof LiteralType))
      return new TypeError('target type must be ConstantType')

    if(targetType.typeChecker !== this.typeChecker)
      return new TypeError('target type is different constant type')
  }

  validateTVarKind(typeVar, kind) {
    return null
  }

  bindType(typeVar, type) {
    return this
  }

  typeKind() {
    return unitKind
  }

  compileType() {
    const { typeChecker } = this
    return new DynamicCompiledType(this, typeChecker)
  }

  typeCheckObject(object) {
    return this.typeChecker(object)
  }

  formatType() {
    const { typeName } = this

    return ['type', typeName]
  }
}

export const literalType = (name, typeChecker) => {
  return new LiteralType(name, typeChecker)
}
