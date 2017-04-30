import { Term } from './term'
import { gensym } from './util'
import { LetTerm } from './let'
import { termImpl } from './impl'
import { VariableTerm } from './variable'
import { assertTerm, assertVariable } from './assert'

const $argVar = Symbol('@argVar')
const $bodyTerm = Symbol('@bodyTerm')

export const LambdaTerm = termImpl(
  class extends Term {
    constructor(argVar, bodyTerm) {
      assertVariable(argVar)
      assertTerm(bodyTerm)

      this[$argVar] = argVar
      this[$bodyTerm] = bodyTerm
    }

    get argVar() {
      return this[$argVar]
    }

    get bodyTerm() {
      return this[$bodyTerm]
    }

    freeTermVariables() {
      const { argVar, bodyTerm } = this

      return bodyTerm.freeTermVariables()
        .delete(argVar)
    }

    alphaConvert() {
      const { argVar, bodyTerm } = this
      const newArgVar = gensym()
      const varTerm = new VariableTerm(newArgVar)
      const newBodyTerm = bodyTerm.bindTerm(argVar, varTerm)
      return new LambdaTerm(newArgVar, newBodyTerm)
    }

    bindTerm(termVar, targetTerm) {
      const { argVar, bodyTerm } = this

      if(termVar === argVar)
        return this

      if(targetTerm.freeTermVariables().has(argVar))
        return this.alphaConvert().bindTerm(termVar, targetTerm)

      const newBodyTerm = bodyTerm.bindTerm(termVar, targetTerm)

      if(newBodyTerm !== bodyTerm) {
        return new LambdaTerm(argVar, bodyTerm)
      } else {
        return this
      }
    }

    weakHeadNormalForm() {
      return this
    }

    normalForm() {
      const { argVar, bodyTerm } = this

      const newBodyTerm = bodyTerm.normalForm()

      if(newBodyTerm !== bodyTerm) {
        return new LambdaTerm(argVar, newBodyTerm)
      } else {
        return this
      }
    }

    compileClosure(closureVars) {
      const { argVar, bodyTerm } = this

      const inClosureVars = closureVars.concat(argVar)
      const bodyClosure = bodyTerm.compileClosure(inClosureVars)

      return closureArgs => inArgs =>
        bodyClosure(closureArgs.push(inArgs))
    }

    applyTerm(argTerm) {
      assertTerm(argTerm)

      const { argVar, bodyTerm } = this

      return new LetTerm(argVar, argTerm, bodyTerm)
    }
  })
