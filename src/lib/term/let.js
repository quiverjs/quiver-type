import { TermVariable, TypeVariable } from '../core/variable'

import {
  isInstanceOf,
  assertNoError,
  assertFunction,
  assertPairArray,
  assertInstanceOf,
  assertListContent
} from '../core/assert'

import { Type } from '../type/type'

import { Term } from './term'
import { ValueTerm } from './value'
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

  *subTerms() {
    const { boundTerm, bodyTerm } = this

    yield boundTerm
    yield bodyTerm
  }

  *subTypes() {
    // empty
  }

  validateVarType(termVar, type) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(type, Type)

    const { boundVar, boundTerm, bodyTerm } = this

    const err = boundTerm.validateVarType(termVar, type)
    if(err) return err

    if(termVar !== boundVar) {
      return bodyTerm.validateVarType(termVar, type)
    } else {
      return null
    }
  }

  map(termMapper, typeMapper) {
    assertFunction(termMapper)
    assertFunction(typeMapper)

    const { boundVar, boundTerm, bodyTerm } = this

    const newBoundTerm = termMapper(boundTerm)
    const newBodyTerm = termMapper(bodyTerm)

    if(newBoundTerm !== boundTerm || newBodyTerm !== bodyTerm) {
      return new LetTerm(boundVar, newBoundTerm, newBodyTerm)
    } else {
      return this
    }
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    const { boundVar, boundTerm, bodyTerm } = this

    if(termVar === boundVar) {
      const newBoundTerm = boundTerm.bindTerm(termVar, term)

      if(newBoundTerm !== boundTerm) {
        return new LetTerm(boundVar, newBoundTerm, bodyTerm)
      } else {
        return this
      }

    } else if(term.freeTermVariables().has(boundVar)) {
      const boundVar2 = new TermVariable(boundVar.name)
      const varTerm = new VariableTerm(boundVar2, boundTerm.termType())

      const newBoundTerm = boundTerm.bindTerm(termVar, term)

      const bodyTerm2 = bodyTerm.bindTerm(boundVar2, varTerm)
      const newBodyTerm = bodyTerm2.bindTerm(termVar, term)

      if(newBoundTerm !== boundTerm || newBodyTerm !== bodyTerm2) {
        return new LetTerm(boundVar2, newBoundTerm, newBodyTerm)
      } else {
        return this
      }

    } else {
      return this.map(
        subTerm => subTerm.bindTerm(termVar, term),
        subType => subType)
    }
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    return this.map(
      subTerm => subTerm.bindType(typeVar, type),
      subType => subType.bindType(typeVar, type))
  }

  evaluate() {
    const { boundVar, boundTerm, bodyTerm } = this

    const newBodyTerm = bodyTerm.evaluate()
    const newBoundTerm = boundTerm.evaluate()

    if(newBoundTerm !== boundTerm || newBodyTerm !== bodyTerm) {
      return new LetTerm(boundVar, newBoundTerm, newBodyTerm).evaluate()

    } else if(
      isInstanceOf(boundTerm, VariableTerm) ||
      isInstanceOf(boundTerm, ValueTerm))
    {
      // bind body term directly if the bound term is variable
      // or value, which are safe to evaluate multiple times.
      return bodyTerm.bindTerm(boundVar, boundTerm).evaluate()

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

export const lets = (bindings, bodyTerm) => {
  assertPairArray(bindings)

  return bindings.reduceRight(
    (bodyTerm, [boundVar, boundTerm]) => {
      return new LetTerm(boundVar, boundTerm, bodyTerm)
    },
    bodyTerm)
}
