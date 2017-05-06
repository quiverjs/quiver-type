import { Term } from './term'
import { gensym } from './util'
import { LetTerm } from './let'
import { termImpl } from './impl'
import { assertType } from '../type/type'
import { VariableTerm } from './variable'
import { LambdaClosure } from '../closure/lambda'
import { assertTerm, assertVariable } from './assert'

const $argVar = Symbol('@argVar')
const $argType = Symbol('@argType')
const $bodyTerm = Symbol('@bodyTerm')

export const LambdaTerm = termImpl(
  class extends Term {
    constructor(argVar, argType, bodyTerm) {
      assertVariable(argVar)
      assertType(argType)
      assertTerm(bodyTerm)

      const err = bodyTerm.validateVarType(argVar, argType)
      if(err) throw err

      super()

      this[$argVar] = argVar
      this[$argType] = argType
      this[$bodyTerm] = bodyTerm
    }

    get argVar() {
      return this[$argVar]
    }

    get argType() {
      return this[$argType]
    }

    get bodyTerm() {
      return this[$bodyTerm]
    }

    freeTermVariables() {
      const { argVar, bodyTerm } = this

      return bodyTerm.freeTermVariables()
        .delete(argVar)
    }

    validateVarType(termVar, termType) {
      const { argVar, bodyTerm } = this

      if(argVar === termVar)
        return null

      return bodyTerm.validateVarType(termVar, termType)
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

      const inClosureVars = closureVars.prepend(argVar)
      const bodyClosure = bodyTerm.compileClosure(inClosureVars)

      return new LambdaClosure(bodyClosure)
    }

    applyTerm(argTerm) {
      assertTerm(argTerm)

      const { argVar, bodyTerm } = this

      return new LetTerm(argVar, argTerm, bodyTerm)
    }
  })
