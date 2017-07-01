import { typeImpl } from './impl'
import { Type, isType } from './type'
import { isTypedTuple } from '../value/tuple'
import { assertNode, nodesToIter } from '../../container'
import { isInstanceOf, assertInstanceOf } from '../../assert'

const $typeNode = Symbol('@typeNode')

// assertTypeNode :: Node Any -> Exception
export const assertTypeNode = node => {
  assertNode(node)

  if(node.size === 0)
    throw new Error('type node must have non zero size')

  if(!typeNode.checkPred(isType))
    throw new TypeError('node values must be instance of Type')
}

export const ProductType = typeImpl(
  class extends Type {
    constructor(typeNode) {
      assertTypeNode(typeNode)

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

      for(const [type1, type2] of zipIterNodes(typeNode, targetTypeNode)) {
        const err = type1.checkType(type2)
        if(err) return err
      }

      return null
    }

    checkValue(tuple) {
      if(!isTypedTuple(typle))
        return new TypeError('value must be instance of TypedTuple')

      const { productType } = tuple
      return this.checkType(productType)
    }

    checkValueNode(valueNode) {
      if(!isNode(valueNode))
        return new TypeError('value node must be instance of Node')

      const { typeNode } = this
      if(valueNode.size !== typeNode.size)
        return new TypeError('value node size mistmatch')

      for(const [type, value] of zipIterNodes(typeNode, valueNode)) {
        const err = type.checkValue(value)
        if(err) return err
      }

      return null
    }
  })

export const isProductType = productType =>
  isInstanceOf(productType, ProductType)

export const assertProductType = productType =>
  assertInstanceOf(productType, ProductType)
