import { IList } from '../core/container'
import { ArgSpec } from './arg-spec'
import { TypedFunction } from '../compiled/function'
import {
  isInstanceOf,
  assertNoError,
  assertFunction,
  assertInstanceOf,
  assertListContent
} from '../core/assert'

import { ArrowType } from '../type/arrow'

import { Term } from './term'

const $type = Symbol('@type')
const $leftTerm = Symbol('@leftTerm')
const $rightTerm = Symbol('@rightTerm')

const compileTermApplication = (closure, closureSpecs, argExtractors) =>
  closureArgs => {
    const func = closure(closureArgs)

    const inArgs = argExtractors.map(
      extractArg => extractArg(closureArgs))

    return func.call(...inArgs)
  }

const partialWrap = (func, partialArgs) =>
  (...restArgs) => {
    return func.call(...partialArgs, ...restArgs)
  }

const compilePartialTermApplication = (closure, closureSpecs, argExtractors, partialArrow) =>
  closureArgs => {
    const func = closure(closureArgs)

    const partialArgs = argExtractors.map(
      extractArg => extractArg(closureArgs))

    const partialFunc = partialWrap(func, partialArgs)

    return new TypedFunction(partialArrow, partialFunc)
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

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!(targetTerm instanceof TermApplicationTerm))
      return new TypeError('target term must be TermApplicationTerm')

    const { leftTerm, rightTerm } = this

    const err = leftTerm.termCheck(targetTerm.leftTerm)
    if(err) return err

    return rightTerm.termCheck(targetTerm.rightTerm)
  }

  freeTermVariables() {
    const { leftTerm, rightTerm } = this
    return leftTerm.freeTermVariables()
      .union(rightTerm.freeTermVariables())
  }

  *subTerms() {
    const { leftTerm, rightTerm } = this

    yield leftTerm
    yield rightTerm
  }

  *subTypes() {
    // empty
  }

  map(termMapper, typeMapper) {
    assertFunction(termMapper)
    assertFunction(typeMapper)

    const { leftTerm, rightTerm } = this

    const newLeftTerm = termMapper(leftTerm)
    const newRightTerm = termMapper(rightTerm)

    if((newLeftTerm === leftTerm) && (newRightTerm === rightTerm))
      return this

    return new TermApplicationTerm(newLeftTerm, newRightTerm)
  }

  evaluate() {
    const { leftTerm, rightTerm } = this

    const newLeftTerm = leftTerm.evaluate()
    const newRightTerm = rightTerm.evaluate()

    if(newLeftTerm.applyTerm) {
      return newLeftTerm.applyTerm(newRightTerm).evaluate()

    } else if(leftTerm === newLeftTerm && rightTerm === newRightTerm) {
      return this

    } else {
      return new TermApplicationTerm(newLeftTerm, newRightTerm)
    }
  }

  compileClosure(closureSpecs) {
    assertListContent(closureSpecs, ArgSpec)
    const partialTerm = this.isPartial() ? this : null
    return this.compileApplication(closureSpecs, IList(), partialTerm)
  }

  compileApplication(closureSpecs, argExtractors, partialTerm) {
    assertListContent(closureSpecs, ArgSpec)
    assertListContent(argExtractors, Function)

    const { leftTerm, rightTerm } = this

    const argExtractor = rightTerm.compileClosure(closureSpecs)

    const inArgExtractors = argExtractors.unshift(argExtractor)

    if(isInstanceOf(leftTerm, TermApplicationTerm)) {
      return leftTerm.compileApplication(closureSpecs, inArgExtractors, partialTerm)

    } else if(partialTerm) {
      const closure = leftTerm.compileClosure(closureSpecs)
      const partialArrow = partialTerm.termType().compileType()
      return compilePartialTermApplication(closure, closureSpecs, inArgExtractors, partialArrow)

    } else {
      const closure = leftTerm.compileClosure(closureSpecs)
      return compileTermApplication(closure, closureSpecs, inArgExtractors)
    }
  }

  isPartial() {
    return isInstanceOf(this.termType(), ArrowType)
  }

  formatTerm() {
    const { leftTerm, rightTerm } = this

    const leftRep = leftTerm.formatTerm()
    const rightRep = rightTerm.formatTerm(0)

    return ['app', leftRep, rightRep]
  }
}

export const apply = (lambdaTerm, ...argTerms) =>
  argTerms.reduce(
    (lambdaTerm, argTerm) =>
      new TermApplicationTerm(lambdaTerm, argTerm),
    lambdaTerm)
