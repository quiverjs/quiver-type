import {
  isInstanceOf,
  assertKeyword,
  assertNoError,
  assertFunction,
  assertInstanceOf,
} from '../core/assert'

import { Kind } from '../kind/kind'

import { CompiledFixedType, $setConcrete } from '../compiled/fixed'

import { Type } from './type'

const $fixedVar = Symbol('@fixedVar')
const $selfKind = Symbol('@selfKind')
const $bodyType = Symbol('@bodyType')
const $compiledType = Symbol('@compiledType')

const $unfoldType = Symbol('@unfoldType')

export class FixedPointType extends Type {
  constructor(fixedVar, selfKind, bodyType) {
    assertKeyword(fixedVar)
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
    this[$compiledType] = null
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
    if(this[$unfoldType]) {
      return this[$unfoldType]
    }

    const { fixedVar, bodyType } = this

    const unfoldType = bodyType.bindType(fixedVar, this)
    this[$unfoldType] = unfoldType

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

  *subTypes() {
    yield this.bodyType
  }

  validateTVarKind(typeVar, kind) {
    assertKeyword(typeVar)
    assertInstanceOf(kind, Kind)

    const { fixedVar, selfKind, bodyType } = this

    if(typeVar === fixedVar) {
      return selfKind.kindCheck(kind)
    } else {
      return bodyType.validateTVarKind(typeVar, kind)
    }
  }

  map(typeMapper) {
    assertFunction(typeMapper)

    const { fixedVar, selfKind, bodyType } = this

    const newBodyType = typeMapper(bodyType)

    if(newBodyType !== bodyType) {
      return new FixedPointType(fixedVar, selfKind, newBodyType)

    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertKeyword(typeVar)
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
    if(this[$compiledType]) {
      return this[$compiledType]
    }

    const compiledType = new CompiledFixedType(this)
    this[$compiledType] = compiledType

    const concreteType = this.unfoldType().compileType()
    compiledType[$setConcrete](concreteType)

    return concreteType
  }

  formatType() {
    const { fixedVar, selfKind, bodyType } = this

    const varRep = fixedVar.name
    const kindRep = selfKind.formatKind()
    const bodyRep = bodyType.formatType()

    return ['fixed-type', [varRep, kindRep], bodyRep]
  }
}

export const fixedType = (fixedVar, selfKind, bodyType) => {
  return new FixedPointType(fixedVar, selfKind, bodyType)
}

export const unfoldType = fixedType => {
  assertInstanceOf(fixedType, FixedPointType)

  return fixedType.unfoldType()
}
