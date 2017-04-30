import { nodeToIter, findItem } from '../list/algo'
import { getEntry, setEntry, mapEntry } from './algo'

const $node = Symbol('@node')

export class Map {
  constructor(node) {
    this[$node] = node
  }

  get node() {
    return this[$node]
  }

  entries() {
    const { node } = this
    return nodeToIter(node)
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
    const i = findItem(node, entry => (entry.key === key))
    return i >= 0
  }

  get(key) {
    const { node } = this
    const [found, value] = getEntry(node, key)

    if(!found)
      throw new Error(`key not found: ${key}`)

    return value
  }

  set(key, value) {
    const { node } = this
    const newNode = setEntry(node, key, value)
    return new Map(newNode)
  }

  getOptional(key, defaultValue=undefined) {
    const { node } = this
    const [found, value] = getEntry(node, key)

    if(found) {
      return value
    } else {
      return defaultValue
    }
  }

  map(mapper) {
    const { node } = this
    const newNode = mapEntry(node, mapper)
    return new Map(newNode)
  }
}
