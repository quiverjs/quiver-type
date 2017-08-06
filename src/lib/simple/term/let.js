import { Term, assertTerm } from './term'
import { termImpl } from './impl'
import { assertVariable } from './assert'
import { LetClosure } from '../closure/let'
import { cons } from '../../container'

const $boundVar = Symbol('@boundVar')
const $boundTerm = Symbol('@boundTerm')
const $bodyTerm = Symbol('@bodyTerm')

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

    normalForm() {
      const { boundVar, boundTerm, bodyTerm } = this
      const newBoundTerm = boundTerm.normalForm()
      const newBodyTerm = bodyTerm.normalForm()

      if(newBoundTerm.isTerminal()) {
        return newBodyTerm
          .bindTerm(boundVar, boundTerm)
          .normalForm()

      } if(newBodyTerm === bodyTerm && newBoundTerm === boundTerm) {
        return this
      } else {
        return new LetTerm(boundVar, newBoundTerm, newBodyTerm)
      }
    }

    compileClosure(closureVars) {
      const { boundVar, boundTerm, bodyTerm } = this

      const boundClosure = boundTerm.compileClosure(closureVars)

      const inClosureVars = cons(closureVars, boundVar)
      const bodyClosure = bodyTerm.compileClosure(inClosureVars)

      return new LetClosure(boundClosure, bodyClosure)
    }
  })
