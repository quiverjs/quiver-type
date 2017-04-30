import { isString } from '../common/assert'

import { isEntry } from './entry'
import { getPredResult } from './util'

const $item = Symbol('@item')
const $next = Symbol('@next')
const $size = Symbol('@size')
const $metadata = Symbol('@metadata')

const $isKeyNode = Symbol('@isKeyNode')
const $isEntryNode = Symbol('@isEntryNode')

export class Node {
  constructor(item, next) {
    this[$item] = item
    this[$next] = next
    this[$metadata] = Object.create(null)

    if(next === null) {
      this[$size] = 1
    } else {
      this[$size] = next.size + 1
    }
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

  get metadata() {
    return this[$metadata]
  }

  isKeyNode() {
    return getPredResult(this, $isKeyNode, isString)
  }

  isEntryNode() {
    return getPredResult(this, $isEntryNode, isEntry)
  }
}
