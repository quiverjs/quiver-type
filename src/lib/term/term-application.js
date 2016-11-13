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
import { isTerminalTerm } from '../util/terminal'

import { Term } from './term'
import { TermLambdaTerm } from './term-lambda'

const $type = Symbol('@type')
const $leftTerm = Symbol('@leftTerm')
const $rightTerm = Symbol('@rightTerm')

const compileTermApplication = (term, closureSpecs, argExtractors) => {
  const compiledBody = term.compileBody(closureSpecs)

  return (...args) => {
    const closure = compiledBody(...args)

    const inArgs = argExtractors.map(
      extractArg => extractArg(...args))

    return closure.call(...inArgs)
  }
}

const partialWrap = (closure, partialArgs) =>
  (...restArgs) => {
    return closure.call(...partialArgs, ...restArgs)
  }

const compilePartialTermApplication = (term, closureSpecs, argExtractors, partialTerm) => {
  const compiledBody = term.compileBody(closureSpecs)

  return (...args) => {
    const closure = compiledBody(...args)

    const partialArgs = argExtractors.map(
      extractArg => extractArg(...args))

    const partialFunc = partialWrap(closure, partialArgs)

    return new CompiledFunction(partialTerm, partialFunc)
  }
}

export class TermApplicationTerm extends Term {
  constructor(leftTerm, rightTerm) {
    assertInstanceOf(leftTerm, Term)
    assertInstanceOf(rightTerm, Term)

    const leftType = leftTerm.termType()

    assertInstanceOf(leftType, ArrowType,
      'type of leftTerm must be arrow type')

    const argType = leftType.leftType
    const rightType = rightTerm.termType()

    assertNoError(argType.typeCheck(rightType))

    // Term application reduces the left type from (a -> b) to b
    const selfType = leftType.rightType

    super()

    this[$leftTerm] = leftTerm
    this[$rightTerm] = rightTerm
    this[$type] = selfType
  }

  get leftTerm() {
    return this[$leftTerm]
  }

  get rightTerm() {
    return this[$rightTerm]
  }

  termType() {
    return this[$type]
  }

  validateVarType(termVar, type) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(type, Type)

    const { leftTerm, rightTerm } = this

    const err = leftTerm.validateVarType(termVar, type)
    if(err) return err

    return rightTerm.validateVarType(termVar, type)
  }

  validateTVarKind(typeVar, kind) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(kind, Kind)

    const { leftTerm, rightTerm } = this

    const err = leftTerm.validateVarType(typeVar, kind)
    if(err) return err

    return rightTerm.validateVarType(typeVar, kind)
  }

  freeTermVariables() {
    const { leftTerm, rightTerm } = this
    return leftTerm.freeTermVariables()
      .union(rightTerm.freeTermVariables())
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    if(!this.freeTermVariables().has(termVar))
      return this

    const { leftTerm, rightTerm } = this

    const newLeftTerm = leftTerm.bindTerm(termVar, term)
    const newRightTerm = rightTerm.bindTerm(termVar, term)

    return new TermApplicationTerm(newLeftTerm, newRightTerm)
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    const { leftTerm, rightTerm } = this

    const newLeftTerm = leftTerm.bindType(typeVar, type)
    const newRightTerm = rightTerm.bindType(typeVar, type)

    if((newLeftTerm === leftTerm) && (newRightTerm === rightTerm))
      return this

    return new TermApplicationTerm(newLeftTerm, newRightTerm)
  }

  evaluate() {
    const { leftTerm, rightTerm } = this

    const newLeftTerm = leftTerm.evaluate()
    const newRightTerm = rightTerm.evaluate()

    if((newLeftTerm instanceof TermLambdaTerm) &&
       isTerminalTerm(newRightTerm))
    {
      return newLeftTerm.applyTerm(newRightTerm).evaluate()

    } else if(leftTerm === newLeftTerm && rightTerm === newRightTerm) {
      return this

    } else {
      return new TermApplicationTerm(newLeftTerm, newRightTerm)

    }
  }

  compileBody(argSpecs) {
    const partialTerm = this.isPartial() ? this : null
    return this.compileApplication(argSpecs, List(), partialTerm)
  }

  compileApplication(closureSpecs, argExtractors, partialTerm) {
    assertListContent(closureSpecs, ArgSpec)
    assertListContent(argExtractors, Function)

    const { leftTerm, rightTerm } = this

    const argExtractor = rightTerm.compileBody(closureSpecs)

    const inArgExtractors = argExtractors.unshift(argExtractor)

    if(leftTerm instanceof TermApplicationTerm) {
      return leftTerm.compileApplication(closureSpecs, inArgExtractors, partialTerm)

    } else if(partialTerm) {
      return compilePartialTermApplication(leftTerm, closureSpecs, inArgExtractors, partialTerm)

    } else {
      return compileTermApplication(leftTerm, closureSpecs, inArgExtractors)
    }
  }

  isPartial() {
    return this.termType() instanceof ArrowType
  }

  formatTerm() {
    const { leftTerm, rightTerm } = this

    const leftRep = leftTerm.formatTerm()
    const rightRep = rightTerm.formatTerm(0)

    return ['app', leftRep, rightRep]
  }
}
