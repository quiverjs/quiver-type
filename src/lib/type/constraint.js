import {
  assertKey,
  isInstanceOf,
  assertFunction,
  assertInstanceOf
} from '../core/assert'

import { constraintKind } from '../kind/constraint'

import { Type } from './type'

const $constraintName = Symbol('@constraintName')
const $specType = Symbol('@specType')

export class ConstraintType extends Type {
  constructor(constraintName, specType) {
    assertKey(constraintName)
    assertInstanceOf(specType, Type)

    super()

    this[$constraintName] = constraintName
    this[$specType] = specType
  }

  get constraintName() {
    return this[$constraintName]
  }

  get specType() {
    return this[$specType]
  }

  *subTypes() {
    yield this.specType
  }

  map(typeMapper) {
    assertFunction(typeMapper)

    const { constraintName, specType } = this

    const newSpecType = typeMapper(specType)

    if(newSpecType !== specType) {
      return new ConstraintType(constraintName, newSpecType)

    } else {
      return this
    }
  }

  typeCheck(targetType) {
    assertInstanceOf(targetType, Type)

    if(targetType === this) {
      return null
    }

    if(!isInstanceOf(targetType, ConstraintType)) {
      return new TypeError('target type must be ConstraintType')
    }

    const { constraintName, specType } = this

    if(constraintName !== targetType.constraintName) {
      return new TypeError('target constaint type have different name')
    }

    return specType.typeCheck(targetType.specType)
  }

  typeKind() {
    return constraintKind
  }

  compileType() {
    throw new Error('ConstraintType cannot be compiled')
  }

  formatType() {
    const { constraintName, specType } = this

    const specRep = specType.formatType()

    return ['constraint-type', constraintName, specRep]
  }
}

export const constraint = (constraintName, specType) => {
  return new ConstraintType(constraintName, specType)
}
