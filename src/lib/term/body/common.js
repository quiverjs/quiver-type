import { mapUnique } from '../../core/util'
import { unionMap } from '../../core/container'
import { TermVariable, TypeVariable } from '../../core/variable'

import {
  assertListContent, assertInstanceOf
} from '../../core/assert'

import { Type } from '../../type/type'
import { Kind } from '../../kind/kind'

import { Term } from '../../term'

const $argTerms = Symbol('@argTerms')
const $returnType = Symbol('@returnType')

export const $newInstance = Symbol('@newInstance')

export class CommonBodyTerm extends Term {
  // constructor :: IList Term -> Type -> Compiler -> ()
  constructor(argTerms, returnType) {
    assertListContent(argTerms, Term)
    assertInstanceOf(returnType, Type)

    super()

    this[$argTerms] = argTerms
    this[$returnType] = returnType
  }

  get argTerms() {
    return this[$argTerms]
  }

  get returnType() {
    return this[$returnType]
  }

  freeTermVariables() {
    return this.argTerms::unionMap(
      argTerm => argTerm.freeTermVariables())
  }

  termType() {
    return this.returnType
  }

  validateVarType(termVar, type) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(type, Type)

    for(const term of this.argTerms) {
      const err = term.validateVarType(termVar, type)
      if(err) return err
    }

    return null
  }

  validateTVarKind(typeVar, kind) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(kind, Kind)

    for(const term of this.argTerms) {
      const err = term.validateTVarKind(typeVar, kind)
      if(err) return err
    }

    return null
  }

  [$newInstance](argTerms, returnType) {
    throw new Error('abstract method not implemented')
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    const { argTerms, returnType } = this

    const [newArgTerms, termModified] = argTerms::mapUnique(
      argTerm => argTerm.bindTerm(termVar, term))

    if(termModified) {
      return this[$newInstance](newArgTerms, returnType)
    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    const { argTerms, returnType } = this

    const [newArgTerms, termModified] = argTerms::mapUnique(
      argTerm => argTerm.bindType(typeVar, type))

    const newReturnType = returnType.bindType(typeVar, type)

    if(termModified || newReturnType !== returnType) {
      return this[$newInstance](newArgTerms, newReturnType)
    } else {
      return this
    }
  }
}
