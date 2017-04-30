import { assertInstanceOf } from '../common/assert'
import { hasItem, nodeToIter } from '../list/algo'

import {
  insertUnique, deleteItem, unionSet
} from './algo'

const $node = Symbol('@node')

const newSet = (currentSet, currentNode, newNode) => {
  if(newNode === currentNode)
    return currentSet

  return new Set(newNode)
}

export class Set {
  constructor(node) {
    this[$node] = node
  }

  get node() {
    return this[$node]
  }

  add(item) {
    const { node } = this
    const newNode = insertUnique(node, item)
    return newSet(this, node, newNode)
  }

  has(item) {
    const { node } = this
    return hasItem(node, item)
  }

  delete(item) {
    const { node } = this
    const newNode = deleteItem(node, item)

    return newSet(this, node, newNode)
  }

  values() {
    const { node } = this
    return nodeToIter(node)
  }

  union(target) {
    assertInstanceOf(target, Set)
    const { node } = this
    const newNode = unionSet(node, target.node)
    return newSet(this, node, newNode)
  }
}
