import { mapUnique } from '../core/util'
import { unionMap } from '../core/container'
import { ArgSpec } from '../compiled/arg-spec'
import {
  assertListContent, assertType, assertFunction
} from '../core/assert'

import { Type } from '../type/type'

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
    for(const expr of this.argExprs) {
      expr.validateVarType(termVar, type)
    }
  }

  bindTerm(termVar, expr) {
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
    const { argExprs, returnType, compiler } = this

    const [newArgExprs, exprModified] = argExprs::mapUnique(
      argExpr => argExpr.bindType(typeVar, type))

    if(exprModified) {
      return new BodyExpression(newArgExprs, returnType, compiler)
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

  isTerminal() {
    return false
  }
}
