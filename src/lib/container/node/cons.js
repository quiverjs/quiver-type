import { Node } from './node'

import { isEntry } from './entry'
import { getPredResult } from './util'
import { isString } from '../common/assert'

const $item = Symbol('@item')
const $next = Symbol('@next')
const $size = Symbol('@size')

const $isKeyNode = Symbol('@isKeyNode')
const $isEntryNode = Symbol('@isEntryNode')

export class Cons extends Node {
  constructor(item, next) {
    super()

    this[$item] = item
    this[$next] = next
    this[$size] = next.size + 1
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

  isNil() {
    return false
  }

  isKeyNode() {
    return getPredResult(this, $isKeyNode, isString)
  }

  isEntryNode() {
    return getPredResult(this, $isEntryNode, isEntry)
  }
}

export const cons = (item, next) =>
  new Cons(item, next)
