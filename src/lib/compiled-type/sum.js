import {
  assertInstanceOf, assertString, assertNoError
} from '../core/assert'

import { SumType } from '../type/sum'

import { CompiledType } from './type'


const $sumType = Symbol('@sumType')
const $tag = Symbol('@tag')
const $value = Symbol('@value')

const $typeMap = Symbol('@typeMap')

class VariantValue {
  constructor(sumType, tag, value) {
    assertInstanceOf(sumType, CompiledSumType)
    assertString(tag)

    const caseType = sumType.typeMap.get(tag)
    assertInstanceOf(caseType, CompiledType)

    assertNoError(caseType.typeCheck(value))

    this[$sumType] = sumType
    this[$tag] = tag
    this[$value] = value
  }

  get sumType() {
    return this[$sumType]
  }

  get tag() {
    return this[$tag]
  }

  get value() {
    return this[$value]
  }
}

export class CompiledSumType extends CompiledType {
  constructor(srcType) {
    assertInstanceOf(srcType, SumType)

    const { typeMap } = srcType

    const compiledTypeMap = typeMap.map(
      caseType => caseType.compileType())

    super(srcType)

    this[$typeMap] = compiledTypeMap
  }

  get typeMap() {
    return this[$typeMap]
  }

  typeCheck(variant) {
    if(!(variant instanceof VariantValue))
      return new TypeError('value must be a VariantValue')

    return this.srcType.typeCheck(
      variant.sumType.srcType)
  }

  construct(tag, value) {
    return new VariantValue(this, tag, value)
  }
}
