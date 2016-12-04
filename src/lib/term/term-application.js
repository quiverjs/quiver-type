import { IList } from '../core/container'
import { ArgSpec } from './arg-spec'
import { CompiledFunction } from '../compiled-term/function'
import { TermVariable, TypeVariable } from '../core/variable'
import {
  assertInstanceOf, isInstanceOf,
  assertListContent, assertNoError
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

    return new CompiledFunction(partialArrow, partialFunc)
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

    const err = leftTerm.validateTVarKind(typeVar, kind)
    if(err) return err

    return rightTerm.validateTVarKind(typeVar, kind)
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
