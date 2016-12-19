import {
  assertInstanceOf, assertListContent, assertNoError
} from '../core/assert'

import { ArgSpec } from './arg-spec'
import { CompiledFunction } from '../compiled-term/function'
import { TermVariable, TypeVariable } from '../core/variable'

import { Kind } from '../kind/kind'
import { Type } from '../type/type'
import { ArrowType } from '../type/arrow'

import { Term } from './term'
import { ValueLambdaTerm } from './lambda'

const $fixedVar = Symbol('@fixedVar')
const $selfType = Symbol('@selfType')
const $bodyLambda = Symbol('@bodyLambda')

export class FixedPointTerm extends Term {
  constructor(fixedVar, selfType, bodyLambda) {
    assertInstanceOf(fixedVar, TermVariable)
    assertInstanceOf(selfType, ArrowType)
    assertInstanceOf(bodyLambda, ValueLambdaTerm)

    if(selfType.rightType instanceof ArrowType) {
      throw new TypeError('currently only support fixed point lambda with single argument')
    }

    assertNoError(selfType.typeCheck(bodyLambda.termType()))
    assertNoError(bodyLambda.validateVarType(fixedVar, selfType))

    super()

    this[$fixedVar] = fixedVar
    this[$selfType] = selfType
    this[$bodyLambda] = bodyLambda
  }

  get fixedVar() {
    return this[$fixedVar]
  }

  get selfType() {
    return this[$selfType]
  }

  get bodyLambda() {
    return this[$bodyLambda]
  }

  termType() {
    return this.selfType
  }

  freeTermVariables() {
    const { fixedVar, bodyLambda } = this

    return bodyLambda.freeTermVariables()
      .delete(fixedVar)
  }

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!(targetTerm instanceof FixedPointTerm))
      return new TypeError('target term must be FixedPointTerm')

    if(this.fixedVar !== targetTerm.fixedVar)
      return new TypeError('target fixed term has different fixed variable')

    return this.bodyLambda.termCheck(targetTerm.bodyLambda)
  }

  validateVarType(termVar, type) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(type, Type)

    const { fixedVar, selfType, bodyLambda } = this

    if(termVar === fixedVar)
      return selfType.typeCheck(type)

    return bodyLambda.validateVarType(termVar, type)
  }

  validateTVarKind(typeVar, kind) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(kind, Kind)

    const { selfType, bodyLambda } = this

    const err = selfType.validateTVarKind(typeVar, kind)
    if(err) return err

    return bodyLambda.validateTVarKind(typeVar, kind)
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    const { fixedVar, selfType, bodyLambda } = this

    if(termVar === fixedVar)
      return this

    const newBodyLambda = bodyLambda.bindTerm(termVar, term)

    if(newBodyLambda !== bodyLambda) {
      return new FixedPointTerm(fixedVar, selfType, newBodyLambda)
    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    const { fixedVar, selfType, bodyLambda } = this

    const newSelfType = selfType.bindType(typeVar, type)
    const newBodyLambda = bodyLambda.bindType(typeVar, type)

    if(selfType !== newSelfType || newBodyLambda !== bodyLambda) {
      return new FixedPointTerm(fixedVar, newSelfType, newBodyLambda)
    } else {
      return this
    }
  }

  evaluate() {
    return this
  }

  compileClosure(closureSpecs) {
    assertListContent(closureSpecs, ArgSpec)

    const { fixedVar, selfType, bodyLambda } = this

    const compiledSelfType = selfType.compileType()

    const inClosureSpecs = closureSpecs.push(
      new ArgSpec(fixedVar, compiledSelfType))

    const bodyClosure = bodyLambda.compileClosure(inClosureSpecs)

    return closureArgs => {
      let inFunc

      const fixedFunc = new CompiledFunction(compiledSelfType,
        (...args) => {
          if(!inFunc)
            throw new TypeError('inner function has not been initialized')

          return inFunc.call(...args)
        })

      inFunc = bodyClosure([...closureArgs, fixedFunc])

      return inFunc
    }
  }

  formatTerm() {
    const { fixedVar, selfType, bodyLambda } = this

    const varRep = fixedVar.name
    const typeRep = selfType.formatType()
    const bodyRep = bodyLambda.formatTerm()

    return ['fixed', [varRep, typeRep], bodyRep]
  }
}

export const fixed = (fixedVar, selfType, bodyLambda) =>
  new FixedPointTerm(fixedVar, selfType, bodyLambda)
