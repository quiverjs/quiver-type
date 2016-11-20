import { assertInstanceOf, assertNoError } from '../core/assert'
import { TermVariable, TypeVariable } from '../core/variable'

import { Type } from '../type/type'
import { ForAllType } from '../type/forall'
import { VariableType } from '../type/variable'

import { Kind } from '../kind/kind'

import { Term } from './term'

const $argTVar = Symbol('@argTVar')
const $argKind = Symbol('@argKind')
const $bodyTerm = Symbol('@bodyTerm')
const $type = Symbol('@type')

export class TypeLambdaTerm extends Term {
  // constructor :: TypeVariable -> Term -> ()
  constructor(argTVar, argKind, bodyTerm) {
    assertInstanceOf(argTVar, TypeVariable)
    assertInstanceOf(argKind, Kind)
    assertInstanceOf(bodyTerm, Term)

    assertNoError(bodyTerm.validateTVarKind(argTVar, argKind))

    const type = new ForAllType(argTVar, argKind, bodyTerm.termType())

    super()

    this[$argTVar] = argTVar
    this[$argKind] = argKind
    this[$bodyTerm] = bodyTerm
    this[$type] = type
  }

  get argTVar() {
    return this[$argTVar]
  }

  get argKind() {
    return this[$argKind]
  }

  get bodyTerm() {
    return this[$bodyTerm]
  }

  freeTermVariables() {
    return this.bodyTerm.freeTermVariables()
  }

  // Type of type lambda is Forall a. t
  termType() {
    return this[$type]
  }

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!(targetTerm instanceof TypeLambdaTerm))
      return new TypeError('target term must be TypeLambdaTerm')

    const { argTVar, argKind, bodyTerm } = this

    const err = argKind.typeCheck(targetTerm.argKind)
    if(err) return err

    const targetTVar = targetTerm.argTVar
    const targetBody = targetTerm.bodyTerm

    if(argTVar !== targetTVar) {
      const newTargetBody = targetBody.bindType(
        targetTVar, new VariableType(argTVar, argKind))

      return bodyTerm.termCheck(newTargetBody)

    } else {
      return bodyTerm.termCheck(targetBody)
    }
  }

  validateVarType(termVar, type) {
    return this.bodyTerm.validateVarType(termVar, type)
  }

  validateTVarKind(typeVar, kind) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(kind, Kind)

    const { argTVar, bodyTerm } = this

    if(argTVar === typeVar)
      return null

    return bodyTerm.validateTVarKind(typeVar, kind)
  }

  bindType(targetTypeVar, type) {
    assertInstanceOf(targetTypeVar, TypeVariable)
    assertInstanceOf(type, Type)

    const { argTVar, argKind, bodyTerm } = this

    if(targetTypeVar === argTVar)
      return this

    const newBodyTerm = bodyTerm.bindType(targetTypeVar, type)

    if(newBodyTerm === bodyTerm)
      return this

    return new TypeLambdaTerm(argTVar, argKind, newBodyTerm)
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    const { argTVar, argKind, bodyTerm } = this

    const newBodyTerm = bodyTerm.bindTerm(termVar, term)

    if(newBodyTerm === bodyTerm)
      return this

    return new TypeLambdaTerm(argTVar, argKind, newBodyTerm)
  }

  evaluate() {
    const { argTVar, argKind, bodyTerm } = this

    const newBodyTerm = bodyTerm.evaluate()

    if(newBodyTerm === bodyTerm)
      return this

    return new TypeLambdaTerm(argTVar, argKind, newBodyTerm)
  }

  // applyType :: Type -> Term
  // Apply a type to the type lambda
  applyType(type) {
    assertInstanceOf(type, Type)

    const { argTVar, argKind, bodyTerm } = this
    assertNoError(argKind.kindCheck(type.typeKind()))

    return bodyTerm.bindType(argTVar, type)
  }

  formatTerm() {
    const { argTVar, argKind, bodyTerm } = this

    const argTVarRep = argTVar.name
    const argKindRep = argKind.formatKind()
    const bodyRep = bodyTerm.formatTerm()

    return ['type-lambda', [argTVarRep, argKindRep], bodyRep]
  }
}
