import { List } from '../core/container'
import { ArgSpec } from '../compiled-term/arg-spec'
import { CompiledFunction } from '../compiled-term/function'
import { TermVariable, TypeVariable } from '../core/variable'
import {
  assertInstanceOf, assertListContent, assertNoError
} from '../core/assert'

import { Kind } from '../kind/kind'
import { Type } from '../type/type'
import { ArrowType } from '../type/arrow'

import { Term } from './term'

const $argVar = Symbol('@argVar')
const $argType = Symbol('@argType')
const $bodyTerm = Symbol('@bodyTerm')
const $type = Symbol('@type')

const closureWrap = (body, closureSize, term) =>
  (...closureArgs) => {
    if(closureArgs.length !== closureSize)
      throw new Error('closure args length mismatch')

    const func = (...inArgs) => {
      return body(...closureArgs, ...inArgs)
    }

    return new CompiledFunction(term, func)
  }

export class TermLambdaTerm extends Term {
  // constructor :: TermVariable -> Type -> Term -> ()
  constructor(argVar, argType, bodyTerm) {
    assertInstanceOf(argVar, TermVariable)
    assertInstanceOf(argType, Type)
    assertInstanceOf(bodyTerm, Term)

    assertNoError(bodyTerm.validateVarType(argVar, argType))

    const type = new ArrowType(argType, bodyTerm.termType())

    super()

    this[$argVar] = argVar
    this[$argType] = argType
    this[$bodyTerm] = bodyTerm
    this[$type] = type
  }

  get argVar() {
    return this[$argVar]
  }

  get argType() {
    return this[$argType]
  }

  get bodyTerm() {
    return this[$bodyTerm]
  }

  freeTermVariables() {
    const { argVar, bodyTerm } = this

    return bodyTerm.freeTermVariables()
      .delete(argVar)
  }

  termType() {
    return this[$type]
  }

  validateVarType(termVar, type) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(type, Type)

    const { argVar, bodyTerm } = this

    if(termVar === argVar)
      return null

    return bodyTerm.validateVarType(termVar, type)
  }

  validateTVarKind(typeVar, kind) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(kind, Kind)

    const { argType, bodyTerm } = this

    const err = argType.validateTVarKind(typeVar, kind)
    if(err) return err

    return bodyTerm.validateTVarKind(typeVar, kind)
  }

  // bindTerm :: TermVariable -> Term
  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    const { argVar, argType, bodyTerm } = this

    if(termVar === argVar) return this

    if(term.freeTermVariables().has(termVar)) {
      const argVar2 = new TermVariable(argVar.name)
      const bodyTerm2 = bodyTerm.bindTerm(argVar, argVar2)
      const newBodyTerm = bodyTerm2.bindTerm(termVar, term)

      return new TermLambdaTerm(argVar2, argType, newBodyTerm)

    } else {
      const newBodyTerm = bodyTerm.bindTerm(termVar, term)

      if(newBodyTerm === bodyTerm) return this

      return new TermLambdaTerm(argVar, argType, newBodyTerm)
    }
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    const { argVar, argType, bodyTerm } = this
    const newArgType = argType.bindType(typeVar, type)
    const newBodyTerm = bodyTerm.bindType(typeVar, type)

    if((newArgType === argType) && (newBodyTerm === bodyTerm))
      return this

    return new TermLambdaTerm(argVar, newArgType, newBodyTerm)
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

    const { argVar, argType, bodyTerm } = this

    const compiledType = argType.compileType()

    const inArgSpecs = argSpecs.push(new ArgSpec(argVar, compiledType))

    if(bodyTerm instanceof TermLambdaTerm) {
      return bodyTerm.compileLambda(closureSpecs, inArgSpecs)
    } else {
      return bodyTerm.compileBody(closureSpecs.concat(inArgSpecs))
    }
  }

  // applyTerm :: Term -> Term
  // Term application to the lambda term
  applyTerm(term) {
    assertInstanceOf(term, Term)

    const { argVar, argType, bodyTerm } = this
    assertNoError(argType.typeCheck(term.termType()))

    return bodyTerm.bindTerm(argVar, term)
  }

  formatTerm() {
    const { argVar, argType, bodyTerm } = this

    const varRep = argVar.name
    const argTypeRep = argType.formatType()
    const bodyRep = bodyTerm.formatTerm()

    return ['lambda', [varRep, argTypeRep], bodyRep]
  }
}
