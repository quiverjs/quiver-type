import { Set } from '../core/container'
import { TypeVariable } from '../core/variable'
import { assertList, assertType, assertFunction } from '../core/assert'

import { typeKind } from '../kind/type'

import { Type } from './type'

const $argTypes = Symbol('@argTypes')
const $func = Symbol('@func')

export class TypeConstructor extends Type {
  constructor(argTypes, func) {
    assertList(argTypes)
    assertFunction(func)

    super()

    for(const argType of argTypes) {
      assertType(argType, Type)
    }

    this[$argTypes] = argTypes
    this[$func] = func
  }

  get argTypes() {
    return this[$argTypes]
  }

  get func() {
    return this[$func]
  }

  freeTypeVariables() {
    return this.argTypes.reduce(
      (result, argType) =>
        result.union(argType.freeTypeVariables()),
      Set())
  }

  typeCheck(targetType) {
    throw new Error('Not implemented')
  }

  validateTVarKind(typeVar, kind) {
    throw new Error('Not implemented')
  }

  bindType(typeVar, type) {
    assertType(typeVar, TypeVariable)
    assertType(type, Type)

    const { argTypes, func } = this

    let argTypesChanged = false

    const newArgTypes = argTypes.map(argType => {
      const newArgType = argType.bindType(typeVar, type)

      if(argType !== newArgType)
        argTypesChanged = true

      return newArgType
    })

    if(!argTypesChanged) return this

    return new TypeConstructor(newArgTypes, func)
  }

  typeKind() {
    return typeKind
  }

  isTerminal() {
    const { argTypes } = this

    for(const argType of argTypes) {
      if(!argType.isTerminal())
        return false
    }

    return true
  }
}
