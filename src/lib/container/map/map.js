import { assertEntryNode } from '../node'

import {
  hasEntry, getEntry,
  setEntry, mapEntry,
  getOptionalEntry,
} from '../algo'

const $node = Symbol('@node')

export class Map {
  constructor(node) {
    assertEntryNode(node)
    this[$node] = node
  }

  get node() {
    return this[$node]
  }

  entries() {
    const { node } = this
    return node.values()
  }

  *keys() {
    for(const { key } of this.entries()) {
      yield key
    }
  }

  *values() {
    for(const { value } of this.entries()) {
      yield value
    }
  }

  get size() {
    const { node } = this
    return node.size
  }

  has(key) {
    const { node } = this
    return hasEntry(node, key)
  }

  get(key) {
    const { node } = this
    return getEntry(node, key)
  }

  set(key, value) {
    const { node } = this
    const newNode = setEntry(node, key, value)

    if(newNode === node)
      return this

    return new Map(newNode)
  }

  getOptional(key, defaultValue) {
    const { node } = this
    return getOptionalEntry(node, key, defaultValue)
  }

  map(mapper) {
    const { node } = this
    const newNode = mapEntry(node, mapper)

    if(newNode === node)
      return this

    return new Map(newNode)
  }
}
