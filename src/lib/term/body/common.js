import { mapUnique } from '../../core/util'
import { unionMap } from '../../core/container'

import {
  assertFunction,
  assertInstanceOf,
  assertListContent
} from '../../core/assert'

import { Type } from '../../type/type'

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

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!(targetTerm instanceof CommonBodyTerm))
      return new TypeError('target term must be CommonBodyTerm')

    const { argTerms, returnType } = this

    const targetArgs = targetTerm.argTerms

    if(argTerms.size !== targetArgs.size)
      return new TypeError('target body term have different number of arg terms')

    for(const [argTerm, targetArgTerm] of argTerms.zip(targetArgs)) {
      const err = argTerm.termCheck(targetArgTerm)
      if(err) return err
    }

    return returnType.typeCheck(targetTerm.returnType)
  }

  *subTerms() {
    yield* this.argTerms
  }

  *subTypes() {
    yield this.returnType
  }

  [$newInstance](argTerms, returnType) {
    throw new Error('abstract method not implemented')
  }

  map(termMapper, typeMapper) {
    assertFunction(termMapper)
    assertFunction(typeMapper)

    const { argTerms, returnType } = this

    const [newArgTerms, termModified] = argTerms::mapUnique(termMapper)

    const newReturnType = typeMapper(returnType)

    if(termModified || newReturnType !== returnType) {
      return this[$newInstance](newArgTerms, newReturnType)
    } else {
      return this
    }
  }
}
