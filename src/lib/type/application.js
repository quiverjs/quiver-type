import { TypeVariable } from '../core/variable'
import { assertType, assertNoError } from '../core/assert'

import { Kind } from '../kind/kind'
import { ArrowKind } from '../kind/arrow'

import { Type } from './type'

const $leftType = Symbol('@leftType')
const $rightType = Symbol('@rightType')
const $selfKind = Symbol('@selfKind')

export class ApplicationType extends Type {
  constructor(leftType, rightType) {
    assertType(leftType, Type)
    assertType(rightType, Type)

    const leftKind = leftType.typeKind()
    const rightKind = rightType.typeKind()

    // console.log('leftKind:', leftKind.formatKind())
    // console.log('rightKind:', rightKind.formatKind())
    // console.log('leftKind.leftKind:', leftKind.leftKind.formatKind())

    assertType(leftKind, ArrowKind)
    assertNoError(leftKind.leftKind.kindCheck(rightKind))

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
      .union(this.rightType.freeTermVariables())
  }

  typeCheck(targetType) {
    assertType(targetType, Type)

    if(!(targetType instanceof ApplicationType))
      return new TypeError('target type must be instance of ApplicationType')

    const { leftType, rightType } = this

    const err = leftType.typeCheck(targetType.leftType)
    if(err) return err

    return rightType.typeCheck(targetType.rightType)
  }

  validateTVarKind(typeVar, kind) {
    assertType(typeVar, TypeVariable)
    assertType(kind, Kind)

    const { leftType, rightType } = this

    const err = leftType.validateTVarKind(typeVar, kind)
    if(err) return err

    return rightType.validateTVarKind(typeVar, kind)
  }

  bindType(typeVar, type) {
    assertType(typeVar, TypeVariable)
    assertType(type, Type)

    const { leftType, rightType } = this

    const newLeftType = leftType.bindType(typeVar, type)
    const newRightType = rightType.bindType(typeVar, type)

    if((newLeftType === leftType) && (newRightType === rightType))
      return this

    return new ApplicationType(newLeftType, newRightType)
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

  isTerminal() {
    return false
  }

  formatType() {
    const { leftType, rightType } = this

    const leftRep = leftType.formatType()
    const rightRep = rightType.formatType()

    return ['app-type', leftRep, rightRep]
  }
}
