import { Term, assertTerm } from './term'
import { termImpl } from './impl'
import { ApplyClosure } from '../closure/apply'
import { assertArrowType } from '../type/arrow'

const $leftTerm = Symbol('@leftTerm')
const $rightTerm = Symbol('@rightTerm')
const $selfType = Symbol('@selfType')

export const ApplyTerm = termImpl(
  class extends Term {
    constructor(leftTerm, rightTerm) {
      assertTerm(leftTerm)
      assertTerm(rightTerm)

      const leftType = leftTerm.termType()
      const rightType = rightTerm.termType()

      assertArrowType(leftType)
      const selfType = leftType.rightType

      const err = selfType.checkType(rightType)
      if(err) throw err

      this[$leftTerm] = leftTerm
      this[$rightTerm] = rightTerm
      this[$selfType] = selfType
    }

    get leftTerm() {
      return this[$leftTerm]
    }

    get rightTerm() {
      return this[$rightTerm]
    }

    termType() {
      return this[$selfType]
    }

    freeTermVariables() {
      const { leftTerm, rightTerm } = this

      const leftVars = leftTerm.freeTermVariables()
      const rightVars = rightTerm.freeTermVariables()

      return leftVars.concat(rightVars)
    }

    bindTerm(termVar, term) {
      const { leftTerm, rightTerm } = this

      const newLeftTerm = leftTerm.bindTerm(termVar, term)
      const newRightTerm = rightTerm.bindTerm(termVar, term)

      if(newLeftTerm === leftTerm && newRightTerm === rightTerm) {
        return this
      } else {
        return new ApplyTerm(newLeftTerm, newRightTerm)
      }
    }

    normalForm() {
      const { leftTerm, rightTerm } = this

      const newLeftTerm = leftTerm.normalForm()
      const newRightTerm = rightTerm.normalForm()

      if(newLeftTerm.isApplicable()) {
        return newLeftTerm
          .applyTerm(newRightTerm)
          .normalForm()

      } else if(newLeftTerm === leftTerm && newRightTerm === rightTerm) {
        return this
      } else {
        return new ApplyTerm(newLeftTerm, newRightTerm)
      }
    }

    compileClosure(closureVars) {
      const { leftTerm, rightTerm } = this

      const leftClosure = leftTerm.compileClosure(closureVars)
      const rightClosure = rightTerm.compileClosure(closureVars)

      return new ApplyClosure(leftClosure, rightClosure)
    }
  })
