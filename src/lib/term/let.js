import { TermVariable, TypeVariable } from '../core/variable'
import {
  isInstanceOf, assertInstanceOf,
  assertListContent, assertNoError
} from '../core/assert'

import { Kind } from '../kind/kind'
import { Type } from '../type/type'

import { Term } from './term'
import { ArgSpec } from './arg-spec'
import { VariableTerm } from './variable'

const $boundVar = Symbol('@boundVar')
const $boundTerm = Symbol('@boundTerm')
const $bodyTerm = Symbol('@bodyTerm')

export class LetTerm extends Term {
  constructor(boundVar, boundTerm, bodyTerm) {
    assertInstanceOf(boundVar, TermVariable)
    assertInstanceOf(boundTerm, Term)
    assertInstanceOf(bodyTerm, Term)

    const bindType = boundTerm.termType()
    assertNoError(bodyTerm.validateVarType(boundVar, bindType))

    super()

    this[$boundVar] = boundVar
    this[$boundTerm] = boundTerm
    this[$bodyTerm] = bodyTerm
  }

  get boundVar() {
    return this[$boundVar]
  }

  get boundTerm() {
    return this[$boundTerm]
  }

  get bodyTerm() {
    return this[$bodyTerm]
  }

  freeTermVariables() {
    const { boundVar, boundTerm, bodyTerm } = this

    return bodyTerm.freeTermVariables()
      .delete(boundVar)
      .union(boundTerm.freeTermVariables())
  }

  termType() {
    return this.bodyTerm.termType()
  }

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!isInstanceOf(targetTerm, LetTerm))
      return new TypeError('target term must be LetTerm')

    const { boundVar, boundTerm, bodyTerm } = this

    if(boundVar !== targetTerm.boundVar)
      return new TypeError('target let term has different bound var')

    const err = boundTerm.termCheck(targetTerm.boundTerm)
    if(err) return err

    return bodyTerm.termCheck(targetTerm.bodyTerm)
  }

  validateVarType(termVar, type) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(type, Type)

    const { boundVar, boundTerm, bodyTerm } = this

    const err = boundTerm.validateVarType(termVar, type)
    if(err) return err

    if(termVar !== boundVar) {
      return bodyTerm.validateVarType(termVar, type)
    }

    return null
  }

  validateTVarKind(typeVar, kind) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(kind, Kind)

    const { boundTerm, bodyTerm } = this

    const err = boundTerm.validateTVarKind(typeVar, kind)
    if(err) return err

    return bodyTerm.validateTVarKind(typeVar, kind)
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    const { boundVar, boundTerm, bodyTerm } = this

    const newBoundTerm = boundTerm.bindTerm(termVar, term)

    if(termVar === boundVar) {
      if(newBoundTerm !== boundTerm) {
        return new LetTerm(boundVar, newBoundTerm, bodyTerm)
      } else {
        return this
      }

    } else if(term.freeTermVariables().has(boundVar)) {
      const boundVar2 = new TermVariable(boundVar.name)
      const varTerm = new VariableTerm(boundVar2, boundTerm.termType())

      const bodyTerm2 = bodyTerm.bindTerm(boundVar2, varTerm)
      const newBodyTerm = bodyTerm2.bindTerm(termVar, term)

      if(newBoundTerm !== boundTerm || newBodyTerm !== bodyTerm2) {
        return new LetTerm(boundVar2, newBoundTerm, newBodyTerm)
      } else {
        return this
      }

    } else {
      const newBodyTerm = bodyTerm.bindTerm(termVar, term)

      if(newBoundTerm !== boundTerm || newBodyTerm !== bodyTerm) {
        return new LetTerm(boundVar, newBoundTerm, newBodyTerm)
      } else {
        return this
      }
    }
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    const { boundVar, boundTerm, bodyTerm } = this

    const newBoundTerm = boundTerm.bindType(typeVar, type)
    const newBodyTerm = bodyTerm.bindType(typeVar, type)

    if(newBoundTerm !== boundTerm || newBodyTerm !== bodyTerm) {
      return new LetTerm(boundVar, newBoundTerm, newBodyTerm)
    } else {
      return this
    }
  }

  evaluate() {
    const { boundVar, boundTerm, bodyTerm } = this

    const newBodyTerm = bodyTerm.evaluate()
    const newBoundTerm = boundTerm.evaluate()

    if(newBoundTerm !== boundTerm || newBodyTerm !== bodyTerm) {
      return new LetTerm(boundVar, newBoundTerm, newBodyTerm)
    } else {
      return this
    }
  }

  compileClosure(closureArgs) {
    assertListContent(closureArgs, ArgSpec)

    const { boundVar, boundTerm, bodyTerm } = this

    const boundClosure = boundTerm.compileClosure(closureArgs)

    const inArgSpec = new ArgSpec(boundVar, boundTerm.termType().compileType())
    const inClosureArgs = closureArgs.push(inArgSpec)

    const bodyClosure = bodyTerm.compileClosure(inClosureArgs)

    return closureArgs => {
      const boundValue = boundClosure(closureArgs)
      const inClosureArgs = [...closureArgs, boundValue]
      return bodyClosure(inClosureArgs)
    }
  }

  formatTerm() {
    const { boundVar, boundTerm, bodyTerm } = this

    const varRep = boundVar.name
    const boundRep = boundTerm.formatTerm()
    const bodyRep = bodyTerm.formatTerm()

    return ['let', [varRep, boundRep], bodyRep]
  }
}

export const lets = (bindings, bodyTerm) =>
  bindings.reduceRight(
    ([boundVar, boundTerm], bodyTerm) =>
      new LetTerm(boundVar, boundTerm, bodyTerm),
    bodyTerm)
