import {
  isInstanceOf, assertInstanceOf,
  assertListContent, assertNoError
} from '../core/assert'

import { ArgSpec } from './arg-spec'
import { CompiledFunction } from '../compiled-term/function'
import { TermVariable, TypeVariable } from '../core/variable'

import { Type } from '../type/type'
import { ArrowType } from '../type/arrow'
import {
  ProductType, RecordType
} from '../type/product'

import { Term } from './term'

const $selfType = Symbol('@selfType')
const $bodyLambda = Symbol('@bodyLambda')

const validateFixedType = type => {
  if(isInstanceOf(type, ArrowType))
    return null

  if(!isInstanceOf(type, ProductType) &&
     !isInstanceOf(type, RecordType))
  {
    return new TypeError('fixed type must be either arrow, product, or record type')
  }

  for(const fieldType of type.fieldTypes.values()) {
    const err = validateFixedType(fieldType)
    if(err) return err
  }

  return null
}

const functionThunk = (compiledType) => {
  let inFunc

  const thunkFunc = new CompiledFunction(compiledType,
    (...args) => {
      if(!inFunc) {
        throw new Error('concrete function is not yet initialized')
      }

      return inFunc.call(...args)
    })

  const setInFunc = func => {
    if(inFunc) {
      throw new Error('inFunc is already set')
    }

    inFunc = func
  }

  return [thunkFunc, setInFunc]
}

export class FixedPointTerm extends Term {
  constructor(bodyLambda) {
    assertInstanceOf(bodyLambda, Term)

    const bodyType = bodyLambda.termType()
    assertInstanceOf(bodyType, ArrowType)

    const selfType = bodyType.leftType
    assertNoError(validateFixedType(selfType))
    assertNoError(selfType.typeCheck(bodyType.rightType))

    super(validateFixedType)

    this[$selfType] = selfType
    this[$bodyLambda] = bodyLambda
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
    return this.bodyLambda.freeTermVariables()
  }

  termCheck(targetTerm) {
    return this.bodyLambda.termCheck(targetTerm)
  }

  validateVarType(termVar, type) {
    return this.bodyLambda.validateVarType(termVar, type)
  }

  validateTVarKind(typeVar, kind) {
    return this.bodyLambda.validateTVarKind(typeVar, kind)
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    const { bodyLambda } = this

    const newBodyLambda = bodyLambda.bindTerm(termVar, term)

    if(newBodyLambda !== bodyLambda) {
      return new FixedPointTerm(newBodyLambda)
    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    const { bodyLambda } = this

    const newBodyLambda = bodyLambda.bindType(typeVar, type)

    if(newBodyLambda !== bodyLambda) {
      return new FixedPointTerm(newBodyLambda)
    } else {
      return this
    }
  }

  evaluate() {
    return this
  }

  compileClosure(closureSpecs) {
    assertListContent(closureSpecs, ArgSpec)

    const { selfType, bodyLambda } = this

    const compiledSelfType = selfType.compileType()
    const bodyClosure = bodyLambda.compileClosure(closureSpecs)

    if(isInstanceOf(selfType, ArrowType)) {
      return closureArgs => {
        const inFunc = bodyClosure(closureArgs)

        const fixedFunc = new CompiledFunction(compiledSelfType,
          (...args) => {
            return inFunc.call(fixedFunc, ...args)
          })

        return fixedFunc
      }

    } else {
      // product/record type
      return closureArgs => {
        const inFunc = bodyClosure(closureArgs)

        const fieldThunks = selfType.fieldTypes.map(
          fieldType => {
            const compiledType = fieldType.compileType()
            return functionThunk(compiledType)
          })

        const fixedProduct = fieldThunks.map(([thunkFunc]) => thunkFunc)
        const inProduct = inFunc.call(fixedProduct)

        for(const [fieldKey, [, setFunc]] of fieldThunks.entries()) {
          const fieldFunc = inProduct.get(fieldKey)
          setFunc(fieldFunc)
        }

        return inProduct
      }
    }
  }

  formatTerm() {
    const { bodyLambda } = this

    const bodyRep = bodyLambda.formatTerm()

    return ['fixed', bodyRep]
  }
}

export const fixed = (fixedVar, selfType, bodyLambda) =>
  new FixedPointTerm(fixedVar, selfType, bodyLambda)
