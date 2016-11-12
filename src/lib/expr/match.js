import { mapUnique } from '../core/util'
import { unionMap } from '../core/container'
import { ArgSpec } from '../compiled/arg-spec'
import { TermVariable, TypeVariable } from '../core/variable'

import { Type } from '../type/type'
import { SumType } from '../type/sum'
import { ArrowType } from '../type/arrow'

import { Kind } from '../kind/kind'

import { Expression } from './expression'
import { VariantExpression } from './variant'
import { TermLambdaExpression } from './term-lambda'

import {
  assertMap, assertType,
  assertListContent, assertNoError
} from '../core/assert'

const $variantExpr = Symbol('@variantExpr')
const $caseExprs = Symbol('@caseExprs')
const $returnType = Symbol('@returnType')

export class MatchExpression extends Expression {
  constructor(variantExpr, returnType, caseExprs) {
    assertType(variantExpr, Expression)
    assertType(returnType, Type)
    assertMap(caseExprs)

    const sumType = variantExpr.exprType()
    assertType(sumType, SumType)

    const { typeMap } = sumType
    if(typeMap.size !== caseExprs.size)
      throw new TypeError('case expressions must match all sum types')

    for(const [tag, caseType] of typeMap) {
      const caseExpr = caseExprs.get(tag)
      if(!caseExpr) {
        throw new TypeError('case expressions must match all sum types')
      }

      assertType(caseExpr, TermLambdaExpression)

      const exprType = caseExpr.exprType()
      assertType(exprType, ArrowType)

      assertNoError(caseType.typeCheck(exprType.leftType))
      assertNoError(returnType.typeCheck(exprType.rightType))
    }

    super()

    this[$variantExpr] = variantExpr
    this[$returnType] = returnType
    this[$caseExprs] = caseExprs
  }

  get variantExpr() {
    return this[$variantExpr]
  }

  get caseExprs() {
    return this[$caseExprs]
  }

  get returnType() {
    return this[$returnType]
  }

  freeTermVariables() {
    const { variantExpr, caseExprs } = this

    return caseExprs::unionMap(
      expr => expr.freeTermVariables())
      .union(variantExpr.freeTermVariables())
  }

  exprType() {
    return this.returnType
  }

  validateVarType(termVar, type) {
    assertType(termVar, TermVariable)
    assertType(type, Type)

    const { variantExpr, caseExprs } = this

    for(const expr of caseExprs.values()) {
      const err = expr.validateVarType(termVar, type)
      if(err) return err
    }

    return variantExpr.validateVarType(termVar, type)
  }

  validateTVarKind(typeVar, kind) {
    assertType(typeVar, TypeVariable)
    assertType(kind, Kind)

    const { variantExpr, caseExprs, returnType } = this

    for(const expr of caseExprs.values()) {
      const err = expr.validateTVarKind(typeVar, kind)
      if(err) return err
    }

    const err = variantExpr.validateTVarKind(typeVar, kind)
    if(err) return err

    return returnType.validateTVarKind(typeVar, kind)
  }

  bindTerm(termVar, expr) {
    assertType(termVar, TermVariable)
    assertType(expr, Expression)

    const { variantExpr, caseExprs, returnType } = this

    const [newCaseExprs, exprModified] = caseExprs::mapUnique(
      caseExpr => caseExpr.bindTerm(termVar, expr))

    const newvariantExpr = variantExpr.bindTerm(termVar, expr)

    if(exprModified || newvariantExpr !== variantExpr) {
      return new MatchExpression(newvariantExpr, returnType, newCaseExprs)
    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertType(typeVar, TypeVariable)
    assertType(type, Type)

    const { variantExpr, caseExprs, returnType } = this

    let exprModified = false

    const newvariantExpr = variantExpr.bindType(typeVar, type)

    if(newvariantExpr !== variantExpr)
      exprModified = true

    const newCaseExprs = caseExprs.map(expr => {
      const newExpr = expr.bindType(typeVar, type)

      if(newExpr !== expr)
        exprModified = true

      return newExpr
    })

    const newReturnType = returnType.bindType(typeVar, type)
    if(newReturnType !== returnType)
      exprModified = true

    if(exprModified) {
      return new MatchExpression(newvariantExpr, newReturnType, newCaseExprs)

    } else {
      return this
    }
  }

  compileBody(argSpecs) {
    assertListContent(argSpecs, ArgSpec)

    const { variantExpr, caseExprs, returnType } = this

    const compiledVariant = variantExpr.compileBody(argSpecs)

    const compiledCases = caseExprs.map(expr =>
      expr.compileBody(argSpecs))

    return (...args) => {
      const variant = compiledVariant(...args)

      const { tag, value } = variant
      const compiledCase = compiledCases.get(tag)

      if(!compiledCase) {
        throw new Error('variant value contains unexpected tag')
      }

      return compiledCase(...args).call(value)
    }
  }

  evaluate() {
    const { variantExpr, caseExprs, returnType } = this

    if(!(variantExpr instanceof VariantExpression))
      return this

    const { tag, bodyExpr } = variantExpr
    const caseExpr = caseExprs.get(tag)

    assertType(caseExpr, TermLambdaExpression)

    return caseExpr.applyExpr(bodyExpr)
  }

  formatExpr() {
    const { variantExpr, caseExprs } = this

    const sumRep = variantExpr.formatExpr()
    const caseReps = caseExprs.map(expr => expr.formatExpr())

    return ['match', sumRep, [...caseReps]]
  }
}
