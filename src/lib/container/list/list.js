import { Node } from '../node'
import { isInstanceOf, assertInstanceOf } from '../assert'

import {
  getItem, setItem,
  appendItem, mapNode,
  findItem, concatNodes,
  nodeToEntryIter,
} from '../algo'

const $node = Symbol('@node')

export class List {
  constructor(node) {
    this[$node] = node
  }

  get node() {
    return this[$node]
  }

  get size() {
    return this.node.size
  }

  get length() {
    return this.size
  }

  get(i) {
    const { node } = this
    return getItem(node, i)
  }

  // set :: Nat -> Any -> List
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

  // values :: This -> Iterator Any
  values() {
    const { node } = this
    return node.values()
  }

  // entries :: This -> Iterator (Nat, Any)
  entries() {
    const { node } = this
    return nodeToEntryIter(node)
  }

  [Symbol.iterator]() {
    return this.values()
  }

  // map :: This -> (Any -> Nat -> Any) -> List
  map(mapper) {
    const { node } = this
    return new List(mapNode(node, mapper))
  }

  // find :: This -> (Any -> Bool) -> Nat
  find(pred) {
    const { node } = this
    return findItem(node, pred)
  }

  // concat :: This -> List -> List
  concat(target) {
    assertInstanceOf(target, List)

    const { node } = this
    const newNode = concatNodes(node, target.node)

    if(newNode === node)
      return this

    return new List(newNode)
  }
}

export const isList = list =>
  isInstanceOf(list, List)

export const assertList = list =>
  assertInstanceOf(list, List)
