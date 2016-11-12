import { mapUnique } from '../core/util'
import { unionMap } from '../core/container'
import { TermVariable, TypeVariable } from '../core/variable'

import { Type } from '../type/type'
import { SumType } from '../type/sum'
import { ArrowType } from '../type/arrow'

import { Kind } from '../kind/kind'

import { Expression } from './expression'

import {
  assertMap, assertType, assertNoError
} from '../core/assert'

const $sumExpr = Symbol('@sumExpr')
const $caseExprs = Symbol('@caseExprs')
const $returnType = Symbol('@returnType')

export class MatchExpression extends Expression {
  constructor(sumExpr, returnType, caseExprs) {
    assertType(sumExpr, Expression)
    assertType(returnType, Type)
    assertMap(caseExprs)

    const sumType = sumExpr.exprType()
    assertType(sumType, SumType)

    const { typeMap } = sumType
    if(typeMap.size !== caseExprs.size)
      throw new TypeError('case expressions must match all sum types')

    for(const [tag, caseType] of typeMap) {
      const caseExpr = caseExprs.get(tag)
      if(!caseExpr) {
        throw new TypeError('case expressions must match all sum types')
      }

      assertType(caseExpr, Expression)

      const exprType = caseExpr.exprType()
      assertType(exprType, ArrowType)

      assertNoError(caseType.typeCheck(exprType.leftType))
      assertNoError(returnType.typeCheck(exprType.rightType))
    }

    super()

    this[$sumExpr] = sumExpr
    this[$returnType] = returnType
    this[$caseExprs] = caseExprs
  }

  get sumExpr() {
    return this[$sumExpr]
  }

  get caseExprs() {
    return this[$caseExprs]
  }

  get returnType() {
    return this[$returnType]
  }

  freeTermVariables() {
    const { sumExpr, caseExprs } = this

    return caseExprs::unionMap(
      expr => expr.freeTermVariables())
      .union(sumExpr.freeTermVariables())
  }

  exprType() {
    return this.returnType
  }

  validateVarType(termVar, type) {
    assertType(termVar, TermVariable)
    assertType(type, Type)

    const { sumExpr, caseExprs } = this

    for(const expr of caseExprs) {
      const err = expr.validateVarType(termVar, type)
      if(err) return err
    }

    return sumExpr.validateVarType(termVar, type)
  }

  validateTVarKind(typeVar, kind) {
    assertType(typeVar, TypeVariable)
    assertType(kind, Kind)

    const { sumExpr, caseExprs, returnType } = this

    for(const expr of caseExprs) {
      const err = expr.validateTVarKind(typeVar, kind)
      if(err) return err
    }

    const err = sumExpr.validateTVarKind(typeVar, kind)
    if(err) return err

    return returnType.validateTVarKind(typeVar, kind)
  }

  bindTerm(termVar, expr) {
    assertType(termVar, TermVariable)
    assertType(expr, Expression)

    const { sumExpr, caseExprs, returnType } = this

    const [newCaseExprs, exprModified] = caseExprs::mapUnique(
      caseExpr => caseExpr.bindTerm(termVar, expr))

    const newSumExpr = sumExpr.bindTerm(termVar, expr)

    if(exprModified || newSumExpr !== sumExpr) {
      return new MatchExpression(newSumExpr, newCaseExprs, returnType)
    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertType(typeVar, TypeVariable)
    assertType(type, Type)

    const { sumExpr, caseExprs, returnType } = this

    let exprModified = false

    const newSumExpr = sumExpr.bindType(typeVar, type)

    if(newSumExpr !== sumExpr)
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
      return new MatchExpression(newSumExpr, newCaseExprs, newReturnType)

    } else {
      return this
    }
  }

  compileBody() {
    throw new Error('not yet implemented')
  }

  evaluate() {
    return this
  }

  formatExpr() {
    const { sumExpr, caseExprs } = this

    const sumRep = sumExpr.formatExpr()
    const caseReps = caseExprs.map(expr => expr.formatExpr())

    return ['match', sumRep, [...caseReps]]
  }
}
