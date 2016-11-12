import {
  assertType,
  assertString, assertNoError
} from '../core/assert'

import { Type } from '../type/type'
import { SumType } from '../type/sum'

import { Kind } from '../kind/kind'

import { TermVariable, TypeVariable } from '../core/variable'

import { Expression } from './expression'

const $sumType = Symbol('@sumType')
const $tag = Symbol('@tag')
const $bodyExpr = Symbol('@bodyExpr')

export class VariantExpression extends Expression {
  constructor(sumType, tag, bodyExpr) {
    assertType(sumType, SumType)
    assertString(tag)
    assertType(bodyExpr, Expression)

    const caseType = sumType.typeMap.get(tag)

    if(!caseType)
      throw new TypeError(`sumType do not have constructor ${tag}`)

    const bodyType = bodyExpr.exprType()
    assertNoError(caseType.typeCheck(bodyType))

    super()

    this[$sumType] = sumType
    this[$tag] = tag
    this[$bodyExpr] = bodyExpr
  }

  get sumType() {
    return this[$sumType]
  }

  get tag() {
    return this[$tag]
  }

  get bodyExpr() {
    return this[$bodyExpr]
  }

  exprType() {
    return this.sumType
  }

  freeTermVariables() {
    return this.bodyExpr.freeTermVariables()
  }

  validateVarType(termVar, type) {
    return this.bodyExpr.validateVarType(termVar, type)
  }

  validateTVarKind(typeVar, kind) {
    assertType(typeVar, TypeVariable)
    assertType(kind, Kind)

    const { sumType, bodyExpr } = this

    const err = sumType.validateTVarKind(typeVar, kind)
    if(err) return err

    return bodyExpr.validateTVarKind(typeVar, kind)
  }

  bindTerm(termVar, expr) {
    assertType(termVar, TermVariable)
    assertType(expr, Expression)

    const { sumType, tag, bodyExpr } = this

    const newBodyExpr = bodyExpr.bindTerm(termVar, expr)

    if(newBodyExpr !== bodyExpr) {
      return new VariantExpression(sumType, tag, newBodyExpr)

    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertType(typeVar, TypeVariable)
    assertType(type, Type)

    const { sumType, tag, bodyExpr } = this

    const newSumType = sumType.bindType(typeVar, type)
    const newBodyExpr = bodyExpr.bindType(typeVar, type)

    if(newSumType !== sumType || newBodyExpr !== bodyExpr) {
      return new VariantExpression(newSumType, tag, newBodyExpr)

    } else {
      return this
    }
  }

  compileBody() {
    throw new Error('not yet implemented')
  }

  evaluate() {
    const { sumType, tag, bodyExpr } = this

    const newBodyExpr = bodyExpr.evaluate()

    if(newBodyExpr !== bodyExpr) {
      return new VariantExpression(sumType, tag, newBodyExpr)

    } else {
      return this
    }
  }

  formatExpr() {
    const { sumType, tag, bodyExpr } = this

    const sumTypeRep = sumType.formatType()
    const bodyRep = bodyExpr.formatExpr()

    return ['variant', [sumTypeRep, tag], bodyRep]
  }
}
