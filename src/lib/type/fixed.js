import { assertInstanceOf, assertNoError } from '../core/assert'
import { TypeVariable } from '../core/variable'

import { Kind } from '../kind/kind'

import { Type } from './type'

const $fixedVar = Symbol('@fixedVar')
const $selfKind = Symbol('@selfKind')
const $bodyType = Symbol('@bodyType')
const $transposedType = Symbol('@transposedType')

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

  transposedType() {
    if(!this[$transposedType]) {
      const { fixedVar, bodyType } = this
      this[$transposedType] = bodyType.bindType(fixedVar, this)
    }

    return this[$transposedType]
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

    if(targetType === this)
      return null

    if(targetType instanceof FixedPointType) {
      const { fixedVar, bodyType } = this

      if(targetType.fixedVar !== fixedVar)
        return new TypeError('target fixed point type is fixing different type variable')

      return bodyType.typeCheck(targetType.bodyType)

    } else {
      const transposedType = this.transposedType()
      if(targetType === transposedType) {
        return null
      } else {
        return transposedType.typeCheck(targetType.bodyType)
      }
    }
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
