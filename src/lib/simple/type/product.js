import { typeImpl } from './impl'
import { Type, isType } from './type'
import { isTypedTuple } from '../value/tuple'
import { isTerm, assertTerm } from '../term/term'
import { isInstanceOf, assertInstanceOf } from '../../assert'
import {
  assertNode, nodesToIter, iterToNode
} from '../../container'

const $typeNode = Symbol('@typeNode')

export const assertTermNode = node => {
  assertNode(node)

  if(node.size === 0)
    throw new Error('term node must have non-zero size')

  if(!node.checkPred(isTerm))
    throw new TypeError('term node values must be instance of Term')
}

// assertTypeNode :: Node Any -> Exception
export const assertTypeNode = node => {
  assertNode(node)

  if(node.size === 0)
    throw new Error('type node must have non zero size')

  if(!node.checkPred(isType))
    throw new TypeError('node values must be instance of Type')
}

export const ProductType = typeImpl(
  class extends Type {
    constructor(typeNode) {
      assertTypeNode(typeNode)

      super()

      this[$typeNode] = typeNode
    }

    get typeNode() {
      return this[$typeNode]
    }

    checkType(targetType) {
      if(!isInstanceOf(targetType, ProductType))
        return new TypeError('target type must be product type')

      const { typeNode } = this
      const targetTypeNode = targetType.typeNode

      if(typeNode.size !== targetTypeNode.size)
        return new TypeError('target product type has different size')

      for(const [type1, type2] of nodesToIter(typeNode, targetTypeNode)) {
        const err = type1.checkType(type2)
        if(err) return err
      }

      return null
    }

    checkValue(tuple) {
      if(!isTypedTuple(tuple))
        return new TypeError('value must be instance of TypedTuple')

      const { productType } = tuple
      return this.checkType(productType)
    }

    checkValueNode(valueNode) {
      assertNode(valueNode)

      const { typeNode } = this
      if(valueNode.size !== typeNode.size)
        return new TypeError('value node size mistmatch')

      for(const [type, value] of nodesToIter(typeNode, valueNode)) {
        const err = type.checkValue(value)
        if(err) return err
      }

      return null
    }

    checkTermNode(termNode) {
      assertNode(termNode)

      const { typeNode } = this
      if(termNode.size !== termNode.size)
        return new TypeError('term node size mismatch')

      for(const [type, term] of nodesToIter(typeNode, termNode)) {
        assertTerm(term)

        const err = type.checkType(term.termType())
        if(err) return err
      }

      return null
    }

    formatType() {
      const { typeNode } = this
      return ['product-type', [...typeNode]]
    }
  })

export const productType = (...subTypes) => {
  const typeNode = iterToNode(subTypes)
  return new ProductType(typeNode)
}

export const isProductType = productType =>
  isInstanceOf(productType, ProductType)

export const assertProductType = productType =>
  assertInstanceOf(productType, ProductType)
