import { Node } from '../node'
import { assertInstanceOf } from '../common/assert'

import {
  getItem, setItem,
  appendItem, mapNode,
  findItem, concatNodes,
  nodeToIter, nodeToEntriesIter,
} from './algo'

const $node = Symbol('@node')

export class List {
  constructor(node) {
    this[$node] = node
  }

  get node() {
    return this[$node]
  }

  get size() {
    const { node } = this

    if(node === null)
      return 0

    return node.size
  }

  get length() {
    return this.size
  }

  get(i) {
    const { node } = this
    return getItem(node, i)
  }

  set(i, value) {
    const { node } = this
    const newNode = setItem(node, i, value)

    if(newNode === node)
      return this

    return new List(newNode)
  }

  append(item) {
    const { node } = this
    return new List(appendItem(node, item))
  }

  prepend(item) {
    const { node } = this
    return new List(new Node(item, node))
  }

  push(item) {
    return this.append(item)
  }

  unshift(item) {
    return this.prepend(item)
  }

  values() {
    const { node } = this
    return nodeToIter(node)
  }

  entries() {
    const { node } = this
    return nodeToEntriesIter(node)
  }

  [Symbol.iterator]() {
    return this.values()
  }

  map(mapper) {
    const { node } = this
    return new List(mapNode(node, mapper))
  }

  find(pred) {
    const { node } = this
    return findItem(node, pred)
  }

  concat(target) {
    assertInstanceOf(target, List)

    const { node } = this
    const newNode = concatNodes(node, target.node)

    if(newNode === node)
      return this

    return new List(newNode)
  }
}
