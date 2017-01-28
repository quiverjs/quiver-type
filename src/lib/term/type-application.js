import { assertInstanceOf, assertNoError } from '../core/assert'
import { TermVariable, TypeVariable } from '../core/variable'

import { Type } from '../type/type'
import { ArrowKind } from '../kind/arrow'

import { isTerminalType } from '../util/terminal'

import { Term } from './term'
import { TypeLambdaTerm } from './type-lambda'

const $leftTerm = Symbol('@leftTerm')
const $rightType = Symbol('@rightType')
const $selfType = Symbol('@selfType')

export class TypeApplicationTerm extends Term {
  // constructor :: Term -> Type -> ()
  constructor(leftTerm, rightType) {
    assertInstanceOf(leftTerm, Term)
    assertInstanceOf(rightType, Type)

    const leftType = leftTerm.termType()
    const leftKind = leftType.typeKind()
    const rightKind = rightType.typeKind()

    assertInstanceOf(leftKind, ArrowKind)
    assertNoError(leftKind.leftKind.kindCheck(rightKind))

    const selfType = leftType.applyType(rightType)

    super()

    this[$leftTerm] = leftTerm
    this[$rightType] = rightType
    this[$selfType] = selfType
  }

  get leftTerm() {
    return this[$leftTerm]
  }

  get rightType() {
    return this[$rightType]
  }

  freeTermVariables() {
    return this.leftTerm.freeTermVariables()
  }

  termType() {
    return this[$selfType]
  }

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!(targetTerm instanceof TypeApplicationTerm))
      return new TypeError('target term must be TypeApplicationTerm')

    const { leftTerm, rightType } = this

    const err = leftTerm.termCheck(targetTerm.leftTerm)
    if(err) return err

    return rightType.typeCheck(targetTerm.rightType)
  }

  *subTerms() {
    yield this.leftTerm
  }

  *subTypes() {
    yield this.rightType
  }

  validateVarType(termVar, type) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(type, Type)

    const { leftTerm, rightType } = this

    const err = leftTerm.validateVarType(termVar, type)
    if(!err) return null

    const appliedLeftTerm = leftTerm.applyType(rightType)
    return appliedLeftTerm.validateVarType(termVar, type)
  }

  map(termMapper, typeMapper) {
    const { leftTerm, rightType } = this

    const newTerm = termMapper(leftTerm)
    const newType = typeMapper(rightType)

    if((newTerm === leftTerm) && (newType === rightType))
      return this

    return new TypeApplicationTerm(newTerm, newType)
  }

  bindTerm(termVar, targetTerm) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(targetTerm, Term)

    return this.map(
      subTerm => subTerm.bindTerm(termVar, targetTerm),
      subType => subType)
  }

  bindType(typeVar, targetType) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(targetType, Type)

    return this.map(
      subTerm => subTerm.bindType(typeVar, targetType),
      subType => subType.bindType(typeVar, targetType))
  }

  evaluate() {
    const { leftTerm, rightType } = this

    const newTerm = leftTerm.evaluate()

    // Only reduce the type application if type argument is terminal,
    // i.e. when type argument has no free type variable.
    if((newTerm instanceof TypeLambdaTerm) &&
       isTerminalType(rightType))
    {
      return newTerm.applyType(rightType).evaluate()

    } else if(newTerm === leftTerm) {
      return this

    } else {
      return new TypeApplicationTerm(newTerm, rightType)
    }
  }

  formatTerm() {
    const { leftTerm, rightType } = this

    const leftRep = leftTerm.formatTerm()
    const rightRep = rightType.formatType()

    return ['type-app', leftRep, rightRep]
  }
}

export const applyType = (leftTerm, ...argTypes) => {
  return argTypes.reduce(
    (leftTerm, argType) => {
      return new TypeApplicationTerm(leftTerm, argType)
    },
    leftTerm)
}
