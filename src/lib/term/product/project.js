import { TermVariable, TypeVariable } from '../../core/variable'

import { Type } from '../../type/type'

import {
  assertInstanceOf, assertString
} from '../../core/assert'

import { ProductType, RecordType } from '../../type/product'

import { Term } from '../term'

import { ProductTerm, RecordTerm } from './product'

const $productTerm = Symbol('@productTerm')
const $fieldKey = Symbol('@fieldKey')
const $fieldType = Symbol('@fieldType')

export class BaseProjectTerm extends Term {
  constructor(productTerm, fieldKey) {
    const productType = productTerm.termType()

    const fieldType = productType.fieldTypes.get(fieldKey)
    if(!fieldType)
      throw new TypeError(`invalid product field ${fieldKey}`)

    super()

    this[$productTerm] = productTerm
    this[$fieldKey] = fieldKey
    this[$fieldType] = fieldType
  }

  get productTerm() {
    return this[$productTerm]
  }

  get fieldKey() {
    return this[$fieldKey]
  }

  get fieldType() {
    return this[$fieldType]
  }

  freeTermVariables() {
    return this.productTerm.freeTermVariables()
  }

  get termType() {
    return this.fieldType
  }

  validateVarType(termVar, type) {
    return this.productTerm.validateVarType(termVar, type)
  }

  validateTVarKind(typeVar, kind) {
    return this.productTerm.validateTVarKind(typeVar, kind)
  }

  bindTerm(termVar, term) {
    assertInstanceOf(termVar, TermVariable)
    assertInstanceOf(term, Term)

    const { productTerm, fieldKey } = this

    const newProductTerm = productTerm.bindTerm(termVar, term)

    if(newProductTerm !== productTerm) {
      return new this.constructor(newProductTerm, fieldKey)

    } else {
      return this
    }
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(type, Type)

    const { productTerm, fieldKey } = this

    const newProductTerm = productTerm.bindType(typeVar, type)

    if(newProductTerm !== productTerm) {
      return new ProjectRecordTerm(newProductTerm, fieldKey)

    } else {
      return this
    }
  }

  evaluate() {
    const { productTerm, fieldKey } = this

    const ProductTerm = this.productTermClass()

    if(productTerm instanceof ProductTerm) {
      return productTerm.getFieldTerm(fieldKey).evaluate()
    }

    const newProductTerm = productTerm.evaluate()

    if(newProductTerm !== productTerm) {
      return new ProjectRecordTerm(newProductTerm, fieldKey)

    } else {
      return this
    }
  }
}

export class ProjectProductTerm extends BaseProjectTerm {
  constructor(productTerm, fieldIndex) {
    assertInstanceOf(productTerm, Term)

    if(typeof(fieldIndex) !== 'number' ||
       fieldIndex < 0 ||
       (fieldIndex|0) !== fieldIndex)
    {
      throw new TypeError('field index must be positive integer')
    }

    const productType = productTerm.termType()
    assertInstanceOf(productType, ProductType)

    super(productTerm, fieldIndex)
  }

  productTermClass() {
    return ProductTerm
  }

  compileBody(argSpecs) {
    throw new Error('not yet implemented')
  }

  formatTerm() {
    const { productTerm, fieldKey } = this

    const prouctTermRep = productTerm.formatTerm()

    return ['project-product', fieldKey, prouctTermRep]
  }
}

export class ProjectRecordTerm extends BaseProjectTerm {
  constructor(recordTerm, fieldKey) {
    assertInstanceOf(recordTerm, Term)
    assertString(fieldKey)

    const recordType = recordTerm.termType()
    assertInstanceOf(recordType, RecordType)

    super(recordTerm, fieldKey)
  }

  productTermClass() {
    return RecordTerm
  }

  compileBody(argSpecs) {
    throw new Error('not yet implemented')
  }

  formatTerm() {
    const { productTerm, fieldKey } = this

    const recordTermRep = productTerm.formatTerm()

    return ['project-record', fieldKey, recordTermRep]
  }
}
