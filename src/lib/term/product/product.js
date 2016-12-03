import { mapUnique } from '../../core/util'
import { unionMap } from '../../core/container'
import { TermVariable, TypeVariable } from '../../core/variable'

import { ArgSpec } from '../../compiled-term/arg-spec'

import { Type } from '../../type/type'
import { Kind } from '../../kind/kind'

import {
  assertMap, assertListContent, assertString,
  assertNoError, assertInstanceOf, isInstanceOf
} from '../../core/assert'

import { ProductType, RecordType } from '../../type/product'

import { Term } from '../term'

const $productType = Symbol('@productType')
const $fieldTerms = Symbol('@fieldTerms')

export class BaseProductTerm extends Term {
  constructor(productType, fieldTerms) {
    const { fieldTypes } = productType

    if(fieldTypes.size !== fieldTerms.size)
      throw new TypeError('field terms size mismatch')

    for(const [fieldKey, fieldType] of fieldTypes.entries()) {
      const fieldTerm = fieldTerms.get(fieldKey)

      if(!fieldTerm)
        throw new TypeError(`missing field ${fieldKey} in record term`)

      assertInstanceOf(fieldTerm, Term)
      assertNoError(fieldType.typeCheck(fieldTerm.termType()))
    }

    super()

    if(this.constructor === BaseProductTerm)
      throw new Error('Abstract class BaseProductTerm cannot be instantiated')

    this[$productType] = productType
    this[$fieldTerms] = fieldTerms
  }

  get productType() {
    return this[$productType]
  }

  get fieldTerms() {
    return this[$fieldTerms]
  }

  getFieldTerm(fieldKey) {
    const fieldTerm = this.fieldTerms.get(fieldKey)
    if(!fieldTerm)
      throw new Error(`invalid field key ${fieldKey}`)

    return fieldTerm
  }

  freeTermVariables() {
    const { fieldTerms } = this

    return fieldTerms::unionMap(
      fieldTerm => fieldTerm.freeTermVariables())
  }

  termType() {
    return this.productType
  }

  validateVarType(termVar, type) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(type, Type)

    const { fieldTerms } = this

    for(const fieldTerm of fieldTerms.values()) {
      const err = fieldTerm.validateVarType(termVar, type)
      if(err) return err
    }
  }

  validateTVarKind(typeVar, kind) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(kind, Kind)

    const { productType, fieldTerms } = this

    for(const fieldTerm of fieldTerms.values()) {
      const err = fieldTerm.validateTVarKind(typeVar, kind)
      if(err) return err
    }

    return productType.validateTVarKind(typeVar, kind)
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    const { productType, fieldTerms } = this

    const [newFieldTerms, isModified] = fieldTerms::mapUnique(
      fieldTerm => fieldTerm.bindTerm(termVar, term))

    if(isModified) {
      return new this.constructor(productType, newFieldTerms)

    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    const { productType, fieldTerms } = this

    const newProductType = productType.bindType(typeVar, type)

    const [newFieldTerms, isModified] = fieldTerms::mapUnique(
      fieldTerm => fieldTerm.bindType(typeVar, type))

    if(isModified || productType !== newProductType) {
      return new this.constructor(newProductType, newFieldTerms)

    } else {
      return this
    }
  }

  termCheck(targetTerm) {
    const { fieldTerms } = this

    const targetFieldTerms = targetTerm.fieldTerms

    if(fieldTerms.size !== targetFieldTerms.size) {
      return new TypeError('field types size mismatch')
    }

    for(const [fieldKey, fieldTerm] of fieldTerms.entries()) {
      const targetFieldTerm = targetFieldTerms.get(fieldKey)

      if(!targetFieldTerm)
        return new TypeError(`missing field ${fieldKey} in target term`)

      const err = fieldTerm.termCheck(targetFieldTerm)
      if(err) return err
    }

    return null
  }

  compileBody(argSpecs) {
    assertListContent(argSpecs, ArgSpec)

    const { fieldTerms } = this

    const compiledFieldTerms = fieldTerms.map(
      fieldTerm => fieldTerm.compileBody(argSpecs))

    return (...args) => {
      return compiledFieldTerms.map(
        compiledTerm => compiledTerm(...args))
    }

    throw new Error('not yet implemented')
  }

  evaluate() {
    const { productType, fieldTerms } = this

    const [newFieldTerms, isModified] = fieldTerms::mapUnique(
      fieldTerm => fieldTerm.evaluate())

    if(isModified) {
      return new this.constructor(productType, newFieldTerms)

    } else {
      return this
    }
  }
}

export class RecordTerm extends BaseProductTerm {
  constructor(fieldTerms) {
    assertMap(fieldTerms)

    for(const [fieldKey, fieldTerm] of fieldTerms.entries()) {
      assertString(fieldKey)
      assertInstanceOf(fieldTerm, Term)
    }

    const recordType = new RecordType(
      fieldTerms.map(term => term.termType()))

    super(recordType, fieldTerms)
  }

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!isInstanceOf(targetTerm, RecordTerm))
      return new TypeError('target term must be RecordTerm')

    return super.termCheck(targetTerm)
  }

  formatTerm() {
    const { fieldTerms } = this

    const fieldTermsRep = fieldTerms.map(
      fieldTerm => fieldTerm.formatTerm())

    return ['record-term', [...fieldTermsRep.entries()]]
  }
}

export class ProductTerm extends BaseProductTerm {
  constructor(fieldTerms) {
    assertListContent(fieldTerms, Term)

    const productType = new ProductType(
      fieldTerms.map(term => term.termType()))

    super(productType, fieldTerms)
  }

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!isInstanceOf(targetTerm, ProductTerm))
      return new TypeError('target term must be ProductTerm')

    return super.termCheck(targetTerm)
  }

  formatTerm() {
    const { fieldTerms } = this

    const fieldTermsRep = fieldTerms.map(
      fieldTerm => fieldTerm.formatTerm())

    return ['product-term', [...fieldTermsRep]]
  }
}
