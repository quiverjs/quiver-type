import { List } from '../core/container'
import { assertType, assertFunction } from '../core/assert'

import { Type } from '../type/type'
import { ArrowType } from '../type/arrow'

import { CompiledType } from './type'

const $argTypes = Symbol('@argTypes')
const $returnType = Symbol('@returnType')

// flattenArrowType :: ArrowType -> List Type
const flattenArrowType = arrowType => {
  const { leftType, rightType } = arrowType

  assertType(leftType, Type)
  assertType(rightType, Type)

  if(rightType instanceof ArrowType) {
    return [leftType, ...flattenArrowType(rightType)]
  } else {
    return [leftType, rightType]
  }
}

// compileTypes :: List Type -> List CompiledType
const compileTypes = argTypes =>
  argTypes.map(argType => argType.compileType())

export class CompiledArrowType extends CompiledType {
  constructor(srcType) {
    assertType(srcType, ArrowType)

    const inTypes = flattenArrowType(srcType)
    const compiledInTypes = compileTypes(inTypes)
    const { length } = compiledInTypes

    const argTypes = List(compiledInTypes.slice(0, length-1))
    const returnType = compiledInTypes[length-1]

    super(srcType)

    this[$argTypes] = argTypes
    this[$returnType] = returnType
  }

  get argTypes() {
    return this[$argTypes]
  }

  get returnType() {
    return this[$returnType]
  }

  typeCheck(func) {
    assertFunction(func)
    const funcType = func.type

    this.srcType.typeCheck(funcType)
  }

  call(func, ...args) {
    const { argTypes, returnType } = this
    const argsLength = argTypes.length

    if(args.length !== argsLength)
      throw new TypeError('arguments size mismatch')

    for(let i=0; i<argsLength; i++) {
      argTypes[i].typeCheck(args[i])
    }

    const result = func(...args)

    returnType.typeCheck(result)

    return result
  }
}
