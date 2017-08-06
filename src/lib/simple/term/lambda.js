import { Term, assertTerm } from './term'
import { LetTerm } from './let'
import { termImpl } from './impl'
import { assertType } from '../type/type'
import { ArrowType } from '../type/arrow'
import { VariableTerm } from './variable'
import { LambdaClosure } from '../closure/lambda'
import { assertVariable } from './assert'
import { cons } from '../../container'
import { gensym } from './gensym'

const $argVar = Symbol('@argVar')
const $argType = Symbol('@argType')
const $bodyTerm = Symbol('@bodyTerm')
const $selfType = Symbol('@selfType')

export const LambdaTerm = termImpl(
  class extends Term {
    constructor(argVar, argType, bodyTerm) {
      assertVariable(argVar)
      assertType(argType)
      assertTerm(bodyTerm)

      const err = bodyTerm.validateVarType(argVar, argType)
      if(err) throw err

      const selfType = new ArrowType(argType, bodyTerm.termType())

      super()

      this[$argVar] = argVar
      this[$argType] = argType
      this[$bodyTerm] = bodyTerm
      this[$selfType] = selfType
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

    get selfType() {
      return this[$selfType]
    }

    termType() {
      return this.selfType
    }

    freeTermVariables() {
      const { argVar, bodyTerm } = this

      return bodyTerm
        .freeTermVariables()
        .delete(argVar)
    }

    validateVarType(termVar, termType) {
      const { argVar, bodyTerm } = this

      if(argVar === termVar)
        return null

      return bodyTerm.validateVarType(termVar, termType)
    }

    alphaConvert() {
      const { argVar, argType, bodyTerm } = this
      const newArgVar = gensym()
      const varTerm = new VariableTerm(newArgVar, argType)
      const newBodyTerm = bodyTerm.bindTerm(argVar, varTerm)
      return new LambdaTerm(newArgVar, argType, newBodyTerm)
    }

    bindTerm(termVar, targetTerm) {
      const { argVar, argType, bodyTerm } = this

      if(termVar === argVar)
        return this

      if(targetTerm.freeTermVariables().has(argVar))
        return this.alphaConvert().bindTerm(termVar, targetTerm)

      const newBodyTerm = bodyTerm.bindTerm(termVar, targetTerm)

      if(newBodyTerm !== bodyTerm) {
        return new LambdaTerm(argVar, argType, newBodyTerm)
      } else {
        return this
      }
    }

    normalForm() {
      const { argVar, argType, bodyTerm } = this

      const newBodyTerm = bodyTerm.normalForm()

      if(newBodyTerm !== bodyTerm) {
        return new LambdaTerm(argVar, argType, newBodyTerm)
      } else {
        return this
      }
    }

    compileClosure(closureVars) {
      const { argVar, bodyTerm, selfType } = this

      const inClosureVars = cons(argVar, closureVars)
      const bodyClosure = bodyTerm.compileClosure(inClosureVars)

      return new LambdaClosure(selfType, bodyClosure)
    }

    applyTerm(argTerm) {
      assertTerm(argTerm)

      const { argVar, argType, bodyTerm } = this

      const err = argType.checkTerm(argTerm)
      if(err) throw err

      return new LetTerm(argVar, argTerm, bodyTerm)
    }

    isApplicable() {
      return true
    }

    formatTerm() {
      const { argVar, argType, bodyTerm } = this

      const argTypeRep = argType.formatType()
      const bodyRep = bodyTerm.formatTerm()

      return ['lambda', [argVar, argTypeRep], bodyRep]
    }
  })

export const lambda = (args, bodyTerm) => {
  const [[argVar, argType], ...restArgs] = args

  if(restArgs.length > 0) {
    const restBodyTerm = lambda(restArgs, bodyTerm)
    return new LambdaTerm(argVar, argType, restBodyTerm)
  } else {
    return new LambdaTerm(argVar, argType, bodyTerm)
  }
}
