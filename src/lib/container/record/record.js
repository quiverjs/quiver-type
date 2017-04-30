import { getItem, setItem, nodeToIter } from '../list/algo'
import { getValue, setValue, nodesToIter } from './algo'

const $keyNode = Symbol('@keyNode')
const $valueNode = Symbol('@valueNode')

export class Record {
  // Constructor :: KeyNode -> Node -> This
  constructor(keyNode, valueNode) {
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
    return getValue(key, keyNode, valueNode)
  }

  set(key, value) {
    const { keyNode, valueNode } = this
    const newValueNode = setValue(keyNode, valueNode, key, value)
    return new Record(keyNode, newValueNode)
  }

  rawGet(i) {
    const { valueNode } = this
    return getItem(valueNode, i)
  }

  rawSet(i, value) {
    const { keyNode, valueNode } = this
    const newValueNode = setItem(valueNode, i, value)
    return new Record(keyNode, newValueNode)
  }

  keys() {
    const { keyNode } = this
    return nodeToIter(keyNode)
  }

  values() {
    const { valueNode } = this
    return nodeToIter(valueNode)
  }

  entries() {
    const { keyNode, valueNode } = this
    return nodesToIter(keyNode, valueNode)
  }
}
