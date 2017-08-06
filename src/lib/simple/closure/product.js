import { assertNode, mapNode } from '../../container'
import { Closure, isClosure } from './closure'
import { TypedTuple } from '../value/tuple'
import { assertProductType } from '../type/product'

const $productType = Symbol('@productType')
const $closureNode = Symbol('@closureNode')

export const assertClosureNode = node => {
  assertNode(node)

  if(!node.checkPred(isClosure))
    throw new TypeError('node values must be instance of Closure')
}

export class ProductClosure extends Closure {
  constructor(productType, closureNode) {
    assertProductType(productType)
    assertClosureNode(closureNode)

    this[$productType] = productType
    this[$closureNode] = closureNode
  }

  get productType() {
    return this[$productType]
  }

  get closureNode() {
    return this[$closureNode]
  }

  bindValues(closureValues) {
    assertNode(closureValues)

    const { productType, closureNode } = this

    const valueNode = mapNode(closureNode,
      closure => closure.bindValues(closureValues))

    return new TypedTuple(productType, valueNode)
  }

  bindApplyArgs(closureValues, args) {
    throw new Error('Cannot apply tuple values to args')
  }
}
