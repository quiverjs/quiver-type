import { TermVariable, TypeVariable } from '../../core/variable'

import { Type } from '../../type/type'

import {
  assertInstanceOf, isInstanceOf,
  assertString, assertListContent
} from '../../core/assert'

import { ArgSpec } from '../../compiled-term/arg-spec'

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

    if(this.constructor === BaseProjectTerm)
      throw new Error('Abstract class BaseProjectTerm cannot be instantiated')

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

  termType() {
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

  termCheck(targetTerm) {
    const { productTerm, fieldKey } = this

    const err = productTerm.termCheck(targetTerm.productTerm)
    if(err) return err

    if(fieldKey !== targetTerm.fieldKey)
      return new TypeError('target term is projecting different field key')

    return null
  }

  evaluate() {
    const { productTerm, fieldKey } = this

    const newProductTerm = productTerm.evaluate()

    if(newProductTerm instanceof this.productTermClass()) {
      return productTerm.getFieldTerm(fieldKey).evaluate()

    } else if(newProductTerm !== productTerm) {
      return new this.constructor(newProductTerm, fieldKey)

    } else {
      return this
    }
  }

  compileBody(argSpecs) {
    assertListContent(argSpecs, ArgSpec)

    const { productTerm, fieldKey } = this

    const compiledProductTerm = productTerm.compileBody(argSpecs)

    return (...args) => {
      const productValue = compiledProductTerm(...args)
      return productValue.get(fieldKey)
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

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!isInstanceOf(targetTerm, ProjectProductTerm))
      return new TypeError('target term must be ProjectProductTerm')

    return super.termCheck(targetTerm)
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

  termCheck(targetTerm) {
    assertInstanceOf(targetTerm, Term)

    if(targetTerm === this) return null

    if(!isInstanceOf(targetTerm, ProjectRecordTerm))
      return new TypeError('target term must be ProjectRecordTerm')

    return super.termCheck(targetTerm)
  }

  formatTerm() {
    const { productTerm, fieldKey } = this

    const recordTermRep = productTerm.formatTerm()

    return ['project-record', fieldKey, recordTermRep]
  }
}
