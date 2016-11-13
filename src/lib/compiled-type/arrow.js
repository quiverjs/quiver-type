import { IList } from '../core/container'
import { assertInstanceOf, assertNoError } from '../core/assert'

import { Type } from '../type/type'
import { ArrowType } from '../type/arrow'

import { CompiledType } from './type'
import { CompiledFunction } from '../compiled-term/function'

const $argTypes = Symbol('@argTypes')
const $returnType = Symbol('@returnType')

// flattenArrowType :: ArrowType -> IList Type
const flattenArrowType = arrowType => {
  const { leftType, rightType } = arrowType

  assertInstanceOf(leftType, Type)
  assertInstanceOf(rightType, Type)

  if(rightType instanceof ArrowType) {
    return [leftType, ...flattenArrowType(rightType)]
  } else {
    return [leftType, rightType]
  }
}

// compileTypes :: IList Type -> IList CompiledType
const compileTypes = argTypes =>
  argTypes.map(argType => argType.compileType())

export class CompiledArrowType extends CompiledType {
  constructor(srcType) {
    assertInstanceOf(srcType, ArrowType)

    const inTypes = flattenArrowType(srcType)
    const compiledInTypes = compileTypes(inTypes)
    const { length } = compiledInTypes

    const argTypes = IList(compiledInTypes.slice(0, length-1))
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
    assertInstanceOf(compiledFunction, CompiledFunction)

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
