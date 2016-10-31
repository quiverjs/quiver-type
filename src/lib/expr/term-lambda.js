import { List } from '../core/container'
import { ArgSpec } from '../compiled/arg-spec'
import { CompiledFunction } from '../compiled/function'
import { TermVariable, TypeVariable } from '../core/variable'
import {
  assertType, assertListContent, assertNoError
} from '../core/assert'

import { Kind } from '../kind/kind'
import { Type } from '../type/type'
import { ArrowType } from '../type/arrow'

import { Expression } from './expression'

const $argVar = Symbol('@argVar')
const $argType = Symbol('@argType')
const $bodyExpr = Symbol('@bodyExpr')
const $type = Symbol('@type')

const closureWrap = (body, closureSize, expr) =>
  (...closureArgs) => {
    if(closureArgs.length !== closureSize)
      throw new Error('closure args length mismatch')

    const func = (...inArgs) => {
      return body(...closureArgs, ...inArgs)
    }

    return new CompiledFunction(expr, func)
  }

export class TermLambdaExpression extends Expression {
  // constructor :: TermVariable -> Type -> Expression -> ()
  constructor(argVar, argType, bodyExpr) {
    assertType(argVar, TermVariable)
    assertType(argType, Type)
    assertType(bodyExpr, Expression)

    assertNoError(bodyExpr.validateVarType(argVar, argType))

    const type = new ArrowType(argType, bodyExpr.exprType())

    super()

    this[$argVar] = argVar
    this[$argType] = argType
    this[$bodyExpr] = bodyExpr
    this[$type] = type
  }

  get argVar() {
    return this[$argVar]
  }

  get argType() {
    return this[$argType]
  }

  get bodyExpr() {
    return this[$bodyExpr]
  }

  freeTermVariables() {
    const { argVar, bodyExpr } = this

    return bodyExpr.freeTermVariables()
      .delete(argVar)
  }

  exprType() {
    return this[$type]
  }

  validateVarType(termVar, type) {
    assertType(termVar, TermVariable)
    assertType(type, Type)

    const { argVar, bodyExpr } = this

    if(termVar === argVar)
      return null

    return bodyExpr.validateVarType(termVar, type)
  }

  validateTVarKind(typeVar, kind) {
    assertType(typeVar, TypeVariable)
    assertType(kind, Kind)

    const { argType, bodyExpr } = this

    const err = argType.validateTVarKind(typeVar, kind)
    if(err) return err

    return bodyExpr.validateTVarKind(typeVar, kind)
  }

  // bindTerm :: TermVariable -> Expression
  bindTerm(termVar, expr) {
    assertType(termVar, TermVariable)
    assertType(expr, Expression)

    const { argVar, argType, bodyExpr } = this

    if(termVar === argVar) return this

    if(expr.freeTermVariables().has(termVar)) {
      const argVar2 = new TermVariable(argVar.name)
      const bodyExpr2 = bodyExpr.bindTerm(argVar, argVar2)
      const newBodyExpr = bodyExpr2.bindTerm(termVar, expr)

      return new TermLambdaExpression(argVar2, argType, newBodyExpr)

    } else {
      const newBodyExpr = bodyExpr.bindTerm(termVar, expr)

      if(newBodyExpr === bodyExpr) return this

      return new TermLambdaExpression(argVar, argType, newBodyExpr)
    }
  }

  bindType(typeVar, type) {
    assertType(typeVar, TypeVariable)
    assertType(type, Type)

    const { argVar, argType, bodyExpr } = this
    const newArgType = argType.bindType(typeVar, type)
    const newBodyExpr = bodyExpr.bindType(typeVar, type)

    if((newArgType === argType) && (newBodyExpr === bodyExpr))
      return this

    return new TermLambdaExpression(argVar, newArgType, newBodyExpr)
  }

  evaluate() {
    return this
  }

  compileBody(closureSpecs) {
    assertListContent(closureSpecs, ArgSpec)

    const closureSize = closureSpecs.size
    const innerBody = this.compileLambda(closureSpecs, List())

    return closureWrap(innerBody, closureSize, this)
  }

  compileLambda(closureSpecs, argSpecs) {
    assertListContent(closureSpecs, ArgSpec)
    assertListContent(argSpecs, ArgSpec)

    const { argVar, argType, bodyExpr } = this

    const compiledType = argType.compileType()

    const inArgSpecs = argSpecs.push(new ArgSpec(argVar, compiledType))

    if(bodyExpr instanceof TermLambdaExpression) {
      return bodyExpr.compileLambda(closureSpecs, inArgSpecs)
    } else {
      return bodyExpr.compileBody(closureSpecs.concat(inArgSpecs))
    }
  }

  // applyExpr :: Expression -> Expression
  // Term application to the lambda expression
  applyExpr(expr) {
    assertType(expr, Expression)

    const { argVar, argType, bodyExpr } = this
    assertNoError(argType.typeCheck(expr.exprType()))

    return bodyExpr.bindTerm(argVar, expr)
  }

  formatExpr() {
    const { argVar, argType, bodyExpr } = this

    const varRep = argVar.name
    const argTypeRep = argType.formatType()
    const bodyRep = bodyExpr.formatExpr()

    return ['lambda', [varRep, argTypeRep], bodyRep]
  }
}
