import { assertProductType } from '../type/product'
import { isInstanceOf, assertInstanceOf } from '../../assert'
import { iterToNode } from '../../container'

const $productType = Symbol('@productType')
const $valueNode = Symbol('@valueNode')

export class TypedTuple {
  // constructor :: This -> ProductType -> Node Any -> ()
  constructor(productType, valueNode) {
    assertProductType(productType)

    const err = productType.checkValueNode(valueNode)
    if(err) throw err

    this[$productType] = productType
    this[$valueNode] = valueNode
  }

  get productType() {
    return this[$productType]
  }

  get valueNode() {
    return this[$valueNode]
  }

  get size() {
    return this.valueNode.size
  }

  get length() {
    return this.size
  }

  get(i) {
    const { valueNode } = this
    return getItem(valueNode, i)
  }

  set(i, value) {
    const { productType, valueNode } = this
    const fieldType = productType.getFieldType(i)

    const err = fieldType.checkValue(value)
    if(err) throw err

    const newValueNode = setItem(valueNode, i, value)

    return new TypedTuple(productType, newValueNode)
  }

  values() {
    const { valueNode } = this
    return valueNode.values()
  }

  entries() {
    const { valueNode } = this
    return valueNode.entries()
  }

  [Symbol.iterator]() {
    return this.values()
  }
}

export const typedTuple = (productType, ...values) => {
  const valueNode = iterToNode(values)
  return new TypedTuple(productType, valueNode)
}

export const isTypedTuple = typedTuple =>
  isInstanceOf(typedTuple, TypedTuple)

export const assertTypedTuple = typedTuple =>
  assertInstanceOf(typedTuple, TypedTuple)
