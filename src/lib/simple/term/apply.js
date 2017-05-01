import { Term } from './term'
import { termImpl } from './impl'
import { LambdaTerm } from './lambda'
import { assertTerm, isInstanceOf } from './assert'

const $leftTerm = Symbol('@leftTerm')
const $rightTerm = Symbol('@rightTerm')

export const ApplyTerm = termImpl(
  class extends Term {
    constructor(leftTerm, rightTerm) {
      assertTerm(leftTerm)
      assertTerm(rightTerm)

      this[$leftTerm] = leftTerm
      this[$rightTerm] = rightTerm
    }

    get leftTerm() {
      return this[$leftTerm]
    }

    get rightTerm() {
      return this[$rightTerm]
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

    weakHeadNormalForm() {
      const { leftTerm, rightTerm } = this

      const leftForm = leftTerm.weakHeadNormalForm()
      const rightForm = rightTerm.weakHeadNormalForm()

      if(isInstanceOf(leftForm, LambdaTerm)) {
        return leftForm.applyTerm(rightTerm)
          .weakHeadNormalForm()
      }

      if(leftForm === leftTerm && rightForm === rightTerm) {
        return this
      } else {
        return new ApplyTerm(leftForm, rightForm)
      }
    }
  })
