import { assertInstanceOf, isInstanceOf, assertNoError } from '../core/assert'
import { TypeVariable } from '../core/variable'

import { Kind } from '../kind/kind'

import { Type } from './type'

const $fixedVar = Symbol('@fixedVar')
const $selfKind = Symbol('@selfKind')
const $bodyType = Symbol('@bodyType')

const $unfoldType = Symbol('@unfoldType')

export class FixedPointType extends Type {
  constructor(fixedVar, selfKind, bodyType) {
    assertInstanceOf(fixedVar, TypeVariable)
    assertInstanceOf(selfKind, Kind)
    assertInstanceOf(bodyType, Type)

    const bodyKind = bodyType.typeKind()
    assertNoError(selfKind.kindCheck(bodyKind))
    assertNoError(bodyType.validateTVarKind(fixedVar, selfKind))

    super()

    this[$fixedVar] = fixedVar
    this[$selfKind] = selfKind
    this[$bodyType] = bodyType
    this[$unfoldType] = null
  }

  get fixedVar() {
    return this[$fixedVar]
  }

  get selfKind() {
    return this[$selfKind]
  }

  get bodyType() {
    return this[$bodyType]
  }

  unfoldType() {
    let unfoldType = this[$unfoldType]

    if(!unfoldType) {
      const { fixedVar, bodyType } = this
      unfoldType = bodyType.bindType(fixedVar, this)
      this[$unfoldType] = unfoldType
    }

    return unfoldType
  }

  typeKind() {
    return this.selfKind
  }

  freeTypeVariables() {
    const { fixedVar, bodyType } = this

    return bodyType.freeTypeVariables()
      .delete(fixedVar)
  }

  typeCheck(targetType) {
    assertInstanceOf(targetType, Type)

    if(targetType === this) return null

    if(!isInstanceOf(targetType, FixedPointType))
      return new TypeError('target type must be fixed point type')

    const { fixedVar, bodyType } = this

    if(targetType.fixedVar !== fixedVar)
      return new TypeError('target fixed point type is fixing different type variable')

    return bodyType.typeCheck(targetType.bodyType)
  }

  validateTVarKind(typeVar, kind) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(kind, Kind)

    const { fixedVar, selfKind, bodyType } = this

    if(typeVar === fixedVar) {
      return selfKind.kindCheck(kind)
    } else {
      return bodyType.validateTVarKind(typeVar, kind)
    }
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    const { fixedVar, selfKind, bodyType } = this

    if(typeVar === fixedVar)
      return this

    const newBodyType = bodyType.bindType(typeVar, type)

    if(newBodyType !== bodyType) {
      return new FixedPointType(fixedVar, selfKind, newBodyType)

    } else {
      return this
    }
  }

  compileType() {
    throw new Error('not yet implemented')
  }

  formatType() {
    const { fixedVar, selfKind, bodyType } = this

    const varRep = fixedVar.name
    const kindRep = selfKind.formatKind()
    const bodyRep = bodyType.formatType()

    return ['fixed-type', [varRep, kindRep], bodyRep]
  }
}
