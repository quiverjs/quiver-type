import { Node } from './node'
import { assertNode } from './assert'
import { nodeToIter, nodeToEntryIter, doGetPred } from './algo'

const $item = Symbol('@item')
const $next = Symbol('@next')
const $size = Symbol('@size')
const $predCache = Symbol('@predCache')

export class Cons extends Node {
  // constructor :: This -> Any -> Node -> ()
  constructor(item, next) {
    assertNode(next)

    super()

    this[$item] = item
    this[$next] = next
    this[$size] = next.size + 1

    this[$predCache] = null
  }

  get item() {
    return this[$item]
  }

  get next() {
    return this[$next]
  }

  get size() {
    return this[$size]
  }

  get predCache() {
    const cache = this[$predCache]
    if(cache) return cache

    const newCache = new WeakMap()
    this[$predCache] = newCache
    return newCache
  }

  isNil() {
    return false
  }

  checkPred(pred) {
    const { predCache } = this
    if(predCache.has(pred))
      return predCache.get(pred)

    const result = doGetPred(this, pred)

    predCache.set(pred, result)
    return result
  }

  values() {
    return nodeToIter(this)
  }

  entries() {
    return nodeToEntryIter(this)
  }

  toString() {
    const { item, next } = this
    return `(cons ${item} ${next})`
  }
}

export const cons = (item, next) =>
  new Cons(item, next)
