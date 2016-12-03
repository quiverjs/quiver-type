import { TermVariable, TypeVariable } from '../../core/variable'

import { Type } from '../../type/type'

import {
  assertInstanceOf, isInstanceOf,
  assertString, assertNoError,
  assertListContent
} from '../../core/assert'

import { ArgSpec } from '../../compiled-term/arg-spec'

import { ProductType, RecordType } from '../../type/product'

import { Term } from '../term'

import { ProductTerm, RecordTerm } from './product'

const $productTerm = Symbol('@productTerm')
const $fieldKey = Symbol('@fieldKey')
const $updateTerm = Symbol('@updateTerm')

export class BaseUpdateTerm extends Term {
  constructor(productTerm, fieldKey, updateTerm) {
    assertInstanceOf(updateTerm, Term)

    const productType = productTerm.termType()

    const fieldType = productType.fieldTypes.get(fieldKey)
    if(!fieldType)
      throw new TypeError(`invalid product field ${fieldKey}`)

    assertNoError(fieldType.typeCheck(updateTerm.termType()))

    super()

    if(this.constructor === BaseUpdateTerm)
      throw new Error('Abstract class BaseUpdateTerm cannot be instantiated')

    this[$productTerm] = productTerm
    this[$fieldKey] = fieldKey
    this[$updateTerm] = updateTerm
  }

  get productTerm() {
    return this[$productTerm]
  }

  get fieldKey() {
    return this[$fieldKey]
  }

  get updateTerm() {
    return this[$updateTerm]
  }

  freeTermVariables() {
    const { productTerm, updateTerm } = this

    return productTerm.freeTermVariables()
      .union(updateTerm.freeTermVariables())
  }

  termType() {
    return this.productTerm.termType()
  }

  validateVarType(termVar, type) {
    const { productTerm, updateTerm } = this

    const err = productTerm.validateVarType(termVar, type)
    if(err) return err

    return updateTerm.validateVarType(termVar, type)
  }

  validateTVarKind(typeVar, kind) {
    const { productTerm, updateTerm } = this

    const err = productTerm.validateTVarKind(typeVar, kind)
    if(err) return err

    return updateTerm.validateTVarKind(typeVar, kind)
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    const { productTerm, fieldKey, updateTerm } = this

    const newProductTerm = productTerm.bindTerm(termVar, term)
    const newUpdateTerm = updateTerm.bindterm(termVar, term)

    if(newProductTerm !== productTerm || newUpdateTerm !== updateTerm) {
      return new this.constructor(newProductTerm, fieldKey, newUpdateTerm)

    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    const { productTerm, fieldKey, updateTerm } = this

    const newProductTerm = productTerm.bindType(typeVar, type)
    const newUpdateTerm = updateTerm.bindType(typeVar, type)

    if(newProductTerm !== productTerm || newUpdateTerm !== updateTerm) {
      return new this.constructor(newProductTerm, fieldKey, newUpdateTerm)

    } else {
      return this
    }
  }

  termCheck(targetTerm) {
    const { productTerm, fieldKey, updateTerm } = this

    const err1 = productTerm.termCheck(targetTerm.productTerm)
    if(err1) return err1

    if(fieldKey !== targetTerm.fieldKey)
      return new TypeError('target term is projecting different field key')

    return updateTerm.termCheck(targetTerm.updateTerm)
  }

  evaluate() {
    const { productTerm, fieldKey, updateTerm } = this

    const newProductTerm = productTerm.evaluate()
    const newUpdateTerm = updateTerm.evaluate()

    const ProductTerm = this.productTermClass()

    if(newProductTerm instanceof ProductTerm) {
      const { fieldTerms } = newProductTerm

      const newFieldTerms = fieldTerms.set(fieldKey, newUpdateTerm)

      return new ProductTerm(newFieldTerms).evaluate()

    } else if(newProductTerm !== productTerm || newUpdateTerm !== updateTerm) {
      return new this.constructor(newProductTerm, fieldKey, newUpdateTerm)

    } else {
      return this
    }
  }

  compileBody(argSpecs) {
    assertListContent(argSpecs, ArgSpec)

    const { productTerm, fieldKey, updateTerm } = this

    const compiledProductTerm = productTerm.compileBody(argSpecs)
    const compiledUpdateTerm = updateTerm.compileBody(argSpecs)

    return (...args) => {
      const productValue = compiledProductTerm(...args)
      const updateValue = compiledUpdateTerm(...args)

      return productValue.set(fieldKey, updateValue)
    }
  }
}

export class UpdateProductTerm extends BaseUpdateTerm {
  constructor(productTerm, fieldIndex, updateTerm) {
    assertInstanceOf(productTerm, Term)

    if(typeof(fieldIndex) !== 'number' ||
       fieldIndex < 0 ||
       (fieldIndex|0) !== fieldIndex)
    {
      throw new TypeError('field index must be positive integer')
    }

    const productType = productTerm.termType()
    assertInstanceOf(productType, ProductType)

    super(productTerm, fieldIndex, updateTerm)
  }

  productTermClass() {
    return ProductTerm
  }

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!isInstanceOf(targetTerm, UpdateProductTerm))
      return new TypeError('target term must be UpdateProductTerm')

    return super.termCheck(targetTerm)
  }

  formatTerm() {
    const { productTerm, fieldKey, updateTerm } = this

    const productTermRep = productTerm.formatTerm()
    const updateTermRep = updateTerm.formatTerm()

    return ['update-product', fieldKey, productTermRep, updateTermRep]
  }
}

export class UpdateRecordTerm extends BaseUpdateTerm {
  constructor(recordTerm, fieldKey, updateTerm) {
    assertInstanceOf(recordTerm, Term)
    assertString(fieldKey)

    const recordType = recordTerm.termType()
    assertInstanceOf(recordType, RecordType)

    super(recordTerm, fieldKey, updateTerm)
  }

  productTermClass() {
    return RecordTerm
  }

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!isInstanceOf(targetTerm, UpdateRecordTerm))
      return new TypeError('target term must be UpdateRecordTerm')

    return super.termCheck(targetTerm)
  }

  formatTerm() {
    const { productTerm, fieldKey, updateTerm } = this

    const recordTermRep = productTerm.formatTerm()
    const updateTermRep = updateTerm.formatTerm()

    return ['update-record', fieldKey, recordTermRep, updateTermRep]
  }
}
