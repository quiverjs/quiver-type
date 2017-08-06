import { Term } from './term'
import { termImpl } from './impl'
import { emptySet } from '../../container'
import { assertType } from '../type/type'
import { isArrowType } from '../type/arrow'
import { assertArrowValue } from '../arrow/arrow'
import { ValueClosure, ArrowValueClosure } from '../closure/value'

const $value = Symbol('@value')
const $valueType = Symbol('@valueType')
const $closure = Symbol('@closure')

export const ValueTerm = termImpl(
  class extends Term {
    // constructor :: This -> Type -> Any -> ()
    constructor(valueType, value) {
      assertType(valueType)

      const err = valueType.checkValue(value)
      if(err) throw err

      super()

      this[$valueType] = valueType
      this[$value] = value

      if(isArrowType(valueType)) {
        this[$closure] = new ArrowValueClosure(value)
      } else {
        this[$closure] = new ValueClosure(value)
      }
    }

    get valueType() {
      return this[$valueType]
    }

    get value() {
      return this[$value]
    }

    get closure() {
      return this[$closure]
    }

    termType() {
      return this.valueType
    }

    freeTermVariables() {
      return emptySet
    }

    validateVarType(termVar, type) {
      return null
    }

    bindTerm(termVar, term) {
      return this
    }

    normalForm() {
      return this
    }

    compileClosure(argVars) {
      return this.closure
    }

    isTerminal() {
      return true
    }

    formatTerm() {
      const { value, valueType } = this
      const typeRep = valueType.formatType()
      if(value.toString) {
        return ['value-term', typeRep, value.toString()]
      } else {
        return ['value-term', typeRep]
      }
    }
  })

export const valueTerm = (valueType, value) =>
  new ValueTerm(valueType, value)

export const arrowValueTerm = (arrowValue) => {
  assertArrowValue(arrowValue)

  return new ValueTerm(arrowValue.arrowType, arrowValue)
}
