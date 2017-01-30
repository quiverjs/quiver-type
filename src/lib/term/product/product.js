import { mapUnique } from '../../core/util'
import { IMap, IList } from '../../core/container'

import {
  assertMap,
  isInstanceOf,
  assertString,
  assertNoError,
  assertFunction,
  assertInstanceOf,
  assertListContent
} from '../../core/assert'

import { ProductType, RecordType } from '../../type/product'

import { Term } from '../term'
import { ArgSpec } from '../arg-spec'

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

  termType() {
    return this.productType
  }

  *subTerms() {
    yield* this.fieldTerms.values()
  }

  *subTypes() {
    yield this.productType
  }

  map(termMapper, typeMapper) {
    assertFunction(termMapper)
    assertFunction(typeMapper)

    const { productType, fieldTerms } = this

    const newProductType = typeMapper(productType)

    const [newFieldTerms, isModified] = fieldTerms::mapUnique(termMapper)

    if(isModified || productType !== newProductType) {
      return new this.constructor(newFieldTerms)

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

  compileClosure(closureSpecs) {
    assertListContent(closureSpecs, ArgSpec)

    const { fieldTerms } = this

    const fieldClosures = fieldTerms.map(
      fieldTerm => fieldTerm.compileClosure(closureSpecs))

    return closureArgs =>
      fieldClosures.map(
        fieldClosure => fieldClosure(closureArgs))

    throw new Error('not yet implemented')
  }

  evaluate() {
    return this.map(
      subTerm => subTerm.evaluate(),
      subType => subType)
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

export const product = (...fieldTerms) =>
  new ProductTerm(IList(fieldTerms))

export const record = fieldTerms =>
  new RecordTerm(IMap(fieldTerms))
