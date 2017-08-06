import { termImpl } from './impl'
import { Term } from './term'
import {
  mapNode, reduceNode, emptySet
} from '../../container'

import { assertProductType } from '../type/product'
import { ProductClosure } from '../closure/product'

const $termNode = Symbol('@termNode')
const $productType = Symbol('@productType')

export const ProductTerm = termImpl(
  class extends Term {
    constructor(productType, termNode) {
      assertProductType(productType)
      const err = productType.checkTermNode(termNode)
      if(err) throw err

      super()

      this[$termNode] = termNode
      this[$productType] = productType
    }

    get termNode() {
      return this[$termNode]
    }

    get productType() {
      return this[$productType]
    }

    termType() {
      return this.productType
    }

    freeTermVariables() {
      const { termNode } = this

      return reduceNode(
        termNode,
        (freeVars, term) =>
           freeVars.union(term.freeTermVariables()),
        emptySet)
    }

    validateVarType(termVar, type) {
      const { termNode } = this
      for(const term of termNode) {
        const err = term.validateVarType(termVar, type)
        if(err) return err
      }
      return null
    }

    bindTerm(termVar, term) {
      const { productType, termNode } = this
      const newTermNode = mapNode(termNode,
        term => term.bindTerm(termVar, term))

      if(newTermNode === termNode) {
        return this
      } else {
        return new ProductTerm(productType, newTermNode)
      }
    }

    normalForm() {
      const { productType, termNode } = this
      const newTermNode = mapNode(termNode,
        term => term.normalForm())

      if(newTermNode === termNode) {
        return this
      } else {
        return new ProductTerm(productType, newTermNode)
      }
    }

    compileClosure(closureVars) {
      const { productType, termNode } = this
      const closureNode = mapNode(termNode,
        term => term.compileClosure(closureVars))

      return new ProductClosure(productType, closureNode)
    }

    formatTerm() {
      const { termNode } = this
      const subTermsRep = mapNode(termNode,
        term => term.formatTerm())

      return ['product-term', [...subTermsRep]]
    }
  })
