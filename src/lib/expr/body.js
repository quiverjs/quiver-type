import { mapUnique } from '../core/util'
import { unionMap } from '../core/container'
import { ArgSpec } from '../compiled/arg-spec'
import { TermVariable, TypeVariable } from '../core/variable'

import {
  assertListContent, assertType, assertFunction
} from '../core/assert'

import { Type } from '../type/type'
import { Kind } from '../kind/kind'

import { Expression } from './expression'

const $argExprs = Symbol('@argExprs')
const $returnType = Symbol('@returnType')
const $compiler = Symbol('@compiler')

export class BodyExpression extends Expression {
  // Compiler :: Function (List Type -> Function)
  // constructor :: List Expression -> Type -> Compiler -> ()
  constructor(argExprs, returnType, compiler) {
    assertListContent(argExprs, Expression)

    assertType(returnType, Type)
    assertFunction(compiler)

    super()

    this[$argExprs] = argExprs
    this[$returnType] = returnType
    this[$compiler] = compiler
  }

  get argExprs() {
    return this[$argExprs]
  }

  get returnType() {
    return this[$returnType]
  }

  get compiler() {
    return this[$compiler]
  }

  freeTermVariables() {
    return this.argExprs::unionMap(
      argExpr => argExpr.freeTermVariables())
  }

  exprType() {
    return this.returnType
  }

  validateVarType(termVar, type) {
    assertType(termVar, TermVariable)
    assertType(type, Type)

    for(const expr of this.argExprs) {
      const err = expr.validateVarType(termVar, type)
      if(err) return err
    }

    return null
  }

  validateTVarKind(typeVar, kind) {
    assertType(typeVar, TypeVariable)
    assertType(kind, Kind)

    for(const expr of this.argExprs) {
      const err = expr.validateTVarKind(typeVar, kind)
      if(err) return err
    }

    return null
  }

  bindTerm(termVar, expr) {
    assertType(termVar, TermVariable)
    assertType(expr, Expression)

    const { argExprs, returnType, compiler } = this

    const [newArgExprs, exprModified] = argExprs::mapUnique(
      argExpr => argExpr.bindTerm(termVar, expr))

    if(exprModified) {
      return new BodyExpression(newArgExprs, returnType, compiler)
    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertType(typeVar, TypeVariable)
    assertType(type, Type)

    const { argExprs, returnType, compiler } = this

    const [newArgExprs, exprModified] = argExprs::mapUnique(
      argExpr => argExpr.bindType(typeVar, type))

    const newReturnType = returnType.bindType(typeVar, type)

    if(exprModified || newReturnType !== returnType) {
      return new BodyExpression(newArgExprs, newReturnType, compiler)
    } else {
      return this
    }
  }

  compileBody(argSpecs) {
    assertListContent(argSpecs, ArgSpec)

    const { argExprs, compiler } = this

    const argExtractors = argExprs.map(
      expr => expr.compileBody(argSpecs))

    const argCompiledTypes = argExprs.map(
      expr => expr.exprType().compileType())

    const compiledBody = compiler(...argCompiledTypes)
    assertType(compiledBody, Function)

    return (...args) => {
      const inArgs = argExtractors.map(
        extractArgs => extractArgs(...args))

      return compiledBody(...inArgs)
    }
  }

  evaluate() {
    return this
  }

  formatExpr() {
    const { argExprs, returnType } = this

    const argExprsRep = [...argExprs.map(expr => expr.formatExpr())]
    const returnTypeRep = returnType.formatType()

    return ['body-compiler', argExprsRep, returnTypeRep]
  }
}
