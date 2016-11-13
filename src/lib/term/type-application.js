import { assertType, assertNoError } from '../core/assert'
import { TermVariable, TypeVariable } from '../core/variable'

import { Type } from '../type/type'
import { Kind } from '../kind/kind'
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
    assertType(leftTerm, Term)
    assertType(rightType, Type)

    const leftType = leftTerm.termType()
    const leftKind = leftType.typeKind()
    const rightKind = rightType.typeKind()

    assertType(leftKind, ArrowKind)
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

  validateVarType(termVar, type) {
    assertType(termVar, TermVariable)
    assertType(type, Type)

    const { leftTerm, rightType } = this

    const err = leftTerm.validateVarType(termVar, type)
    if(!err) return null

    const leftType = leftTerm.applyType(rightType)
    return leftType.validateVarType(termVar, type)
  }

  validateTVarKind(typeVar, kind) {
    assertType(typeVar, TypeVariable)
    assertType(kind, Kind)

    const { leftTerm, rightType } = this

    const err = leftTerm.validateTVarKind(typeVar, kind)
    if(!err) return null

    const leftType = leftTerm.applyType(rightType).termType()
    return leftType.validateTVarKind(typeVar, kind)
  }

  bindTerm(termVar, targetTerm) {
    assertType(termVar, TermVariable)
    assertType(targetTerm, Term)

    const { leftTerm, rightType } = this

    const newTerm = leftTerm.bindTerm(termVar, targetTerm)

    if(newTerm === leftTerm)
      return this

    return new TypeApplicationTerm(newTerm, rightType)
  }

  bindType(typeVar, targetType) {
    assertType(typeVar, TypeVariable)
    assertType(targetType, Type)

    const { leftTerm, rightType } = this

    const newTerm = leftTerm.bindType(typeVar, targetType)
    const newType = rightType.bindType(typeVar, targetType)

    if((newTerm === leftTerm) && (newType === rightType))
      return this

    return new TypeApplicationTerm(newTerm, newType)
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
