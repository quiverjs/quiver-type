import { assertNode, assertKeyNode } from '../node'

import {
  getItem,
  setItem,
  mapNode,
  nodesToIter,
  getRecordValue,
  setRecordValue,
} from '../algo'

const $keyNode = Symbol('@keyNode')
const $valueNode = Symbol('@valueNode')

export class Record {
  // Constructor :: KeyNode -> Node -> This
  constructor(keyNode, valueNode) {
    assertKeyNode(keyNode)
    assertNode(valueNode)

    if(keyNode.size !== valueNode.size)
      throw new Error('size of key node and value node must match')

    this[$keyNode] = keyNode
    this[$valueNode] = valueNode
  }

  get size() {
    const { keyNode } = this
    return keyNode.size
  }

  get keyNode() {
    return this[$keyNode]
  }

  get valueNode() {
    return this[$valueNode]
  }

  get(key) {
    const { keyNode, valueNode } = this
    return getRecordValue(key, keyNode, valueNode)
  }

  set(key, value) {
    const { keyNode, valueNode } = this
    const newValueNode = setRecordValue(keyNode, valueNode, key, value)

    if(newValueNode === valueNode)
      return this

    return new Record(keyNode, newValueNode)
  }

  // $get :: This -> Nat -> Any
  $get(i) {
    const { valueNode } = this
    return getItem(valueNode, i)
  }

  // $set :: This -> Nat -> Any -> Record
  $set(i, value) {
    const { keyNode, valueNode } = this
    const newValueNode = setItem(valueNode, i, value)

    if(newValueNode === valueNode)
      return this

    return new Record(keyNode, newValueNode)
  }

  keys() {
    const { keyNode } = this
    return keyNode.values()
  }

  values() {
    const { valueNode } = this
    return valueNode.values()
  }

  entries() {
    const { keyNode, valueNode } = this
    return nodesToIter(keyNode, valueNode)
  }

  mapValues(mapper) {
    const { keyNode, valueNode } = this

    const newValueNode = mapNode(valueNode, mapper)

    if(newValueNode === valueNode)
      return this

    return new Record(keyNode, newValueNode)
  }
}
