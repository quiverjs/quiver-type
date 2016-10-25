import { assertType, assertFunction, assertString } from '../core/assert'

import { typeKind } from '../kind/type'
import { CompiledLiteralType } from '../compiled/literal'

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
    return Set()
  }

  typeCheck(type) {
    assertType(type, Type)

    if(!(type instanceof LiteralType))
      return new TypeError('target type must be ConstantType')

    if(type.typeChecker !== this.typeChecker)
      return new TypeError('target type is different constant type')
  }

  validateTVarKind(typeVar, kind) {
    return null
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

  compileType() {
    return new CompiledLiteralType(this)
  }

  typeCheckObject(object) {
    return this.typeChecker(object)
  }

  formatType() {
    const { typeName } = this

    return ['type', typeName]
  }
}
