import { IList, ISet } from '../core/container'
import { TypeVariable } from '../core/variable'
import {
  assertListContent, assertInstanceOf,
  assertFunction, assertArray 
} from '../core/assert'

import { DynamicCompiledType } from '../compiled/dynamic'

import { unitKind } from '../kind/unit'

import { Type } from './type'

const $argTypes = Symbol('@argTypes')
const $typeCheckerBuilder = Symbol('@typeCheckerBuilder')

export class TypeConstructor extends Type {
  constructor(argTypes, typeCheckerBuilder) {
    assertListContent(argTypes, Type)
    assertFunction(typeCheckerBuilder)

    super()

    this[$argTypes] = argTypes
    this[$typeCheckerBuilder] = typeCheckerBuilder
  }

  get argTypes() {
    return this[$argTypes]
  }

  get typeCheckerBuilder() {
    return this[$typeCheckerBuilder]
  }

  freeTypeVariables() {
    return this.argTypes.reduce(
      (result, argType) =>
        result.union(argType.freeTypeVariables()),
      ISet())
  }

  typeCheck(targetType) {
    assertInstanceOf(targetType, Type)

    if(targetType === this) return null

    if(!(targetType instanceof TypeConstructor))
      return new TypeError('target type must be type constructor')

    const selfArgTypes = this.argTypes
    const targetArgTypes = targetType.argTypes

    if(selfArgTypes.size !== targetArgTypes.size)
      return new TypeError('type constructor size mismatch')

    for(const [selfType, targetType] of selfArgTypes.zip(targetArgTypes)) {
      const err = selfType.typeCheck(targetType)
      if(err) return err
    }

    return null
  }

  validateTVarKind(typeVar, kind) {
    const { argTypes } = this

    for(const argType of argTypes) {
      const err = argType.validateTVarKind(typeVar, kind)
      if(err) return err
    }

    return null
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    const { argTypes, typeCheckerBuilder } = this

    let argTypesChanged = false

    const newArgTypes = argTypes.map(argType => {
      const newArgType = argType.bindType(typeVar, type)

      if(argType !== newArgType)
        argTypesChanged = true

      return newArgType
    })

    if(!argTypesChanged) return this

    return new TypeConstructor(newArgTypes, typeCheckerBuilder)
  }

  compileType() {
    const { argTypes, typeCheckerBuilder } = this
    const compiledArgTypes = argTypes.map(type => type.compileType())

    const typeChecker = typeCheckerBuilder(compiledArgTypes)
    assertFunction(typeChecker)

    return new DynamicCompiledType(this, typeChecker)
  }

  formatType() {
    const { argTypes } = this

    const argTypeReps = [...argTypes.map(type => type.formatType())]

    return ['type-constructor', argTypeReps]
  }

  typeKind() {
    return unitKind
  }
}

export const typeConstructor = (argTypes, typeCheckerBuilder) => {
  assertArray(argTypes)

  return new TypeConstructor(IList(argTypes), typeCheckerBuilder)
}
