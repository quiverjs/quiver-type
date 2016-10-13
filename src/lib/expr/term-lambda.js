import { TypeEnv } from '../core/env'
import { List } from '../core/container'
import { ArgSpec } from '../compiled/arg-spec'
import { TermVariable, TypeVariable } from '../core/variable'
import { assertType, assertListContent } from '../core/assert'

import { Type } from '../type/type'
import { ArrowType } from '../type/arrow'

import { Expression } from './expression'

const $argVar = Symbol('@argVar')
const $argType = Symbol('@argType')
const $bodyExpr = Symbol('@bodyExpr')

export class TermLambdaExpression extends Expression {
  // constructor :: TermVariable -> Type -> Expression -> ()
  constructor(argVar, argType, bodyExpr) {
    assertType(argVar, TermVariable)
    assertType(argType, Type)
    assertType(bodyExpr, Expression)

    const typeEnv = new TypeEnv()
      .set(argVar, argType)

    bodyExpr.exprType(typeEnv)

    super()

    this[$argVar] = argVar
    this[$argType] = argType
    this[$bodyExpr] = bodyExpr
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

  exprType(env) {
    assertType(env, TypeEnv)

    const { argVar, argType, bodyExpr } = this

    const inEnv = env.set(argVar, argType)
    const bodyType = bodyExpr.exprType(inEnv)

    return new ArrowType(argType, bodyType)
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
    const newArgType = argType.bindType(typeVar, type.getType())
    const newBodyExpr = bodyExpr.bindType(typeVar, type)

    if((newArgType === argType) && (newBodyExpr === bodyExpr))
      return this

    return new TermLambdaExpression(argVar, newArgType, newBodyExpr)
  }

  evaluate() {
    return this
  }

  compileBody(argSpecs) {
    assertListContent(argSpecs, ArgSpec)

    return this.compileLambda(List())
  }

  compileLambda(argSpecs) {
    assertListContent(argSpecs, ArgSpec)

    const { argVar, argType, bodyExpr } = this

    const compiledType = argType.compileType()

    const inArgSpecs = argSpecs.push(new ArgSpec(argVar, compiledType))

    if(bodyExpr instanceof TermLambdaExpression) {
      return bodyExpr.compileLambda(inArgSpecs)
    } else {
      return bodyExpr.compileBody(inArgSpecs)
    }
  }

  compileApplication(argSpecs, argFuncs) {
    assertListContent(argSpecs, ArgSpec)
    assertListContent(argFuncs, Function)

    const compiledFunc = this.compileLambda(List())

    return (...args) => {
      const inArgs = argFuncs.map(argFunc => argFunc(args))
      return compiledFunc(inArgs)
    }
  }

  isTerminal() {
    return true
  }

  // applyExpr :: Expression -> Expression
  // Term application to the lambda expression
  applyExpr(expr) {
    assertType(expr, Expression)

    const { argVar, argType, bodyExpr } = this
    argType.typeCheck(expr.exprType(new TypeEnv()))

    return bodyExpr.bindTerm(argVar, expr)
  }
}
