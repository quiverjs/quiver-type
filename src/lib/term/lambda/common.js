import { TermVariable, TypeVariable } from '../../core/variable'
import {
  assertInstanceOf, assertNoError
} from '../../core/assert'

import { Kind } from '../../kind/kind'
import { Type } from '../../type/type'
import { ArrowType } from '../../type/arrow'

import { Term } from '../term'
import { VariableTerm } from '../variable'

const $argVar = Symbol('@argVar')
const $argType = Symbol('@argType')
const $bodyTerm = Symbol('@bodyTerm')
const $type = Symbol('@type')

export class LambdaTerm extends Term {
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

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!(targetTerm instanceof this.constructor))
      return new TypeError('target term must be same instance of LambdaTerm')

    const { argVar, argType, bodyTerm } = this

    const err = argType.typeCheck(targetTerm.argType)
    if(err) return err

    const targetVar = targetTerm.argVar
    const targetBody = targetTerm.bodyTerm

    if(argVar !== targetVar) {
      const newTargetBody = targetBody.bindTerm(
        targetVar, new VariableTerm(argVar, argType))

      return bodyTerm.termCheck(newTargetBody)

    } else {
      return bodyTerm.termCheck(targetBody)
    }
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

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    const { argVar, argType, bodyTerm } = this

    if(termVar === argVar) return this

    if(term.freeTermVariables().has(argVar)) {
      const argVar2 = new TermVariable(argVar.name)
      const argTerm2 = new VariableTerm(argVar2, argType)

      const bodyTerm2 = bodyTerm.bindTerm(argVar, argTerm2)
      const newBodyTerm = bodyTerm2.bindTerm(termVar, term)

      if(newBodyTerm !== bodyTerm2) {
        return new this.constructor(argVar2, argType, newBodyTerm)
      } else {
        return this
      }

    } else {
      const newBodyTerm = bodyTerm.bindTerm(termVar, term)

      if(newBodyTerm !== bodyTerm) {
        return new this.constructor(argVar, argType, newBodyTerm)
      } else {
        return this
      }
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

    return new this.constructor(argVar, newArgType, newBodyTerm)
  }

  evaluate() {
    return this
  }

  compileClosure(closureArgs) {
    throw new Error('not implemented')
  }

  // applyTerm :: Term -> Term
  // Term application to the lambda term
  applyTerm(term) {
    throw new Error('not implemented')
  }

  formatTerm() {
    throw new Error('not implemented')
  }
}
