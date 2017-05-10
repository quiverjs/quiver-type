import { assertNode } from '../node'
import { assertInstanceOf } from '../assert'
import {
  hasItem, deleteItem,
  insertUnique, unionSet,
} from '../algo'

const $node = Symbol('@node')

export class Set {
  constructor(node) {
    assertNode(node)
    this[$node] = node
  }

  get node() {
    return this[$node]
  }

  get size() {
    return this.node.size
  }

  add(item) {
    const { node } = this
    const newNode = insertUnique(node, item)

    if(newNode === node)
      return this

    return new Set(newNode)
  }

  has(item) {
    const { node } = this
    return hasItem(node, item)
  }

  delete(item) {
    const { node } = this
    const newNode = deleteItem(node, item)

    if(newNode === node)
      return this

    return new Set(newNode)
  }

  values() {
    const { node } = this
    return node.values()
  }

  union(target) {
    assertInstanceOf(target, Set)
    const { node } = this
    const newNode = unionSet(node, target.node)

    if(newNode === node)
      return this

    return new Set(newNode)
  }
}

export const isSet = set =>
  isIntanceOf(set, Set)

export const assertSet = set =>
  assertInstanceOf(set, Set)
