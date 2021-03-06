import {
  isInstanceOf,
  assertNoError,
  assertFunction,
  assertInstanceOf
} from '../core/assert'

import { ArrowKind } from '../kind/arrow'

import { isTerminalType } from '../util/terminal'

import { Type } from './type'

const $leftType = Symbol('@leftType')
const $rightType = Symbol('@rightType')
const $selfKind = Symbol('@selfKind')

export class ApplicationType extends Type {
  constructor(leftType, rightType) {
    assertInstanceOf(leftType, Type)
    assertInstanceOf(rightType, Type)

    const leftKind = leftType.typeKind()
    const rightKind = rightType.typeKind()

    assertInstanceOf(leftKind, ArrowKind)
    assertNoError(leftKind.leftKind.kindCheck(rightKind))

    if(isTerminalType(leftType) && leftType.applyType) {
      return leftType.applyType(rightType)
    }

    const selfKind = leftKind.rightKind

    super()

    this[$leftType] = leftType
    this[$rightType] = rightType
    this[$selfKind] = selfKind
  }

  get leftType() {
    return this[$leftType]
  }

  get rightType() {
    return this[$rightType]
  }

  typeKind() {
    return this[$selfKind]
  }

  freeTypeVariables() {
    return this.leftType.freeTypeVariables()
      .union(this.rightType.freeTypeVariables())
  }

  typeCheck(targetType) {
    assertInstanceOf(targetType, Type)

    if(targetType === this) return null

    if(!isInstanceOf(targetType, ApplicationType))
      return new TypeError('target type must be instance of ApplicationType')

    const { leftType, rightType } = this

    const err = leftType.typeCheck(targetType.leftType)
    if(err) return err

    return rightType.typeCheck(targetType.rightType)
  }

  *subTypes() {
    const { leftType, rightType } = this

    yield leftType
    yield rightType
  }

  map(typeMapper) {
    assertFunction(typeMapper)

    const { leftType, rightType } = this

    const newLeftType = typeMapper(leftType)
    const newRightType = typeMapper(rightType)

    if((newLeftType === leftType) && (newRightType === rightType)) {
      return this
    } else {
      return new ApplicationType(newLeftType, newRightType)
    }
  }

  applyType(targetType) {
    const selfKind = this.typeKind()

    if(!(selfKind instanceof ArrowKind))
      throw new TypeError('type of non-arrow kind cannot be applied to other type')

    assertNoError(selfKind.leftKind.kindCheck(targetType.typeKind()))

    return new ApplicationType(this, targetType)
  }

  compileType() {
    throw new Error('ApplicationType cannot be compiled')
  }

  formatType() {
    const { leftType, rightType } = this

    const leftRep = leftType.formatType()
    const rightRep = rightType.formatType()

    return ['app-type', leftRep, rightRep]
  }
}

export const typeApp = (leftType, ...argTypes) => {
  return argTypes.reduce(
    (leftType, rightType) => {
      return new ApplicationType(leftType, rightType)
    },
    leftType)
}
