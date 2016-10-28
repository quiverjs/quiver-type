import { List } from '../core/container'
import { assertType, assertNoError } from '../core/assert'

import { Type } from '../type/type'
import { ArrowType } from '../type/arrow'

import { CompiledType } from './type'
import { CompiledFunction } from './function'

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

  typeCheck(compiledFunction) {
    assertType(compiledFunction, CompiledFunction)

    return this.srcType.typeCheck(compiledFunction.srcType)
  }

  call(compiledFunction, ...args) {
    assertNoError(this.typeCheck(compiledFunction))

    return this.directCall(compiledFunction.func, ...args)
  }

  directCall(func, ...args) {
    const { argTypes, returnType } = this
    const argsLength = argTypes.size

    if(args.length !== argsLength)
      throw new TypeError('arguments size mismatch')

    for(let i=0; i<argsLength; i++) {
      assertNoError(argTypes.get(i).typeCheck(args[i]))
    }

    const result = func(...args)

    assertNoError(returnType.typeCheck(result))

    return result
  }
}
