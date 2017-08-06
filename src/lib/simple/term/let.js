import { Term, assertTerm } from './term'
import { termImpl } from './impl'
import { assertVariable, isInstanceOf } from './assert'
import { VariableTerm } from './variable'
import { LetClosure } from '../closure/let'
import { cons } from '../../container'
import { gensym } from './gensym'

const $boundVar = Symbol('@boundVar')
const $boundTerm = Symbol('@boundTerm')
const $bodyTerm = Symbol('@bodyTerm')
const $applyTerm = Symbol('@applyTerm')

export const LetTerm = termImpl(
  class extends Term {
    // constructor :: This -> Node (Var, Term) -> Term -> ()
    constructor(boundVar, boundTerm, bodyTerm) {
      assertVariable(boundVar)
      assertTerm(boundTerm)
      assertTerm(bodyTerm)

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

    termType() {
      return this.bodyTerm.termType()
    }

    freeTermVariables() {
      const { boundVar, boundTerm, bodyTerm } = this
      const boundFreeVars = boundTerm.freeTermVariables()
      const bodyFreeVars = bodyTerm.freeTermVariables()

      return bodyFreeVars
        .delete(boundVar)
        .union(boundFreeVars)
    }

    validateVarType(termVar, type) {
      const { boundVar, boundTerm, bodyTerm } = this

      const err = boundTerm.validateVarType(termVar, type)
      if(err) return err

      if(termVar !== boundVar) {
        return bodyTerm.validateVarType(termVar, type)
      }

      return null
    }

    bindTerm(termVar, term) {
      const { boundVar, boundTerm, bodyTerm } = this
      const newBoundTerm = boundTerm.bindTerm(termVar, term)

      if(termVar !== boundVar) {
        const newBodyTerm = bodyTerm.bindTerm(termVar, term)

        if(newBodyTerm === bodyTerm && newBoundTerm === boundTerm) {
          return this
        } else {
          return new LetTerm(boundVar, newBoundTerm, newBodyTerm)
        }
      } else if(newBoundTerm === boundTerm) {
        return this
      } else {
        return new LetTerm(boundVar, newBoundTerm, bodyTerm)
      }
    }

    isApplicable() {
      return this.bodyTerm.isApplicable()
    }

    [$applyTerm](argTerm) {
      const { boundVar, boundTerm, bodyTerm } = this

      let newBodyTerm
      if(isInstanceOf(bodyTerm, LetTerm)) {
        newBodyTerm = bodyTerm[$applyTerm](argTerm)
      } else {
        newBodyTerm = bodyTerm.applyTerm(argTerm)
      }

      if(newBodyTerm === bodyTerm) {
        return this
      } else {
        return new LetTerm(boundVar, boundTerm, newBodyTerm)
      }
    }

    applyTerm(argTerm) {
      assertTerm(argTerm)

      if(!this.isApplicable())
        throw new Error('given let term cannot be applied term')

      const selfType = this.termType()
      const argType = argTerm.termType()

      const err = selfType.leftType.checkType(argType)
      if(err) throw err

      const boundVar = gensym()
      const varTerm = new VariableTerm(boundVar, argType)

      const bodyTerm = this[$applyTerm](varTerm)

      return new LetTerm(boundVar, argTerm, bodyTerm)
    }

    normalForm() {
      const { boundVar, boundTerm, bodyTerm } = this
      const newBoundTerm = boundTerm.normalForm()
      const newBodyTerm = bodyTerm.normalForm()

      if(newBoundTerm.isTerminal()) {
        return newBodyTerm
          .bindTerm(boundVar, newBoundTerm)
          .normalForm()

      } else if(newBodyTerm === bodyTerm && newBoundTerm === boundTerm) {
        return this

      } else {
        return new LetTerm(boundVar, newBoundTerm, newBodyTerm)
      }
    }

    compileClosure(closureVars) {
      const { boundVar, boundTerm, bodyTerm } = this

      const boundClosure = boundTerm.compileClosure(closureVars)

      const inClosureVars = cons(boundVar, closureVars)
      const bodyClosure = bodyTerm.compileClosure(inClosureVars)

      return new LetClosure(boundClosure, bodyClosure)
    }

    formatTerm() {
      const { boundVar, boundTerm, bodyTerm } = this

      const boundRep = boundTerm.formatTerm()
      const bodyRep = bodyTerm.formatTerm()

      return ['let-term', [boundVar, boundRep], bodyRep]
    }
  })

export const letTerm = (boundArgs, bodyTerm) => {
  const [[boundVar, boundTerm], ...restArgs] = boundArgs
  if(restArgs.length > 0) {
    const inBodyTerm = letTerm(restArgs, bodyTerm)
    return new LetTerm(boundVar, boundTerm, inBodyTerm)
  } else {
    return new LetTerm(boundVar, boundTerm, bodyTerm)
  }
}
