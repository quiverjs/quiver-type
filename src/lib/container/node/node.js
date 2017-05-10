import { assertInstanceOf } from '../assert'

export class Node {
  constructor() {
    if(this.constructor === Node)
      throw new Error('Abstract class Closure cannot be instantiated')
  }

  // item :: This -> Error Any
  get item() {
    throw new Error('not implemented')
  }

  // next :: This -> Error Node
  get next() {
    throw new Error('not implemented')
  }

  // size :: This -> Nat
  get size() {
    throw new Error('not implemented')
  }

  // isNode :: This -> Bool
  get isNode() {
    return true
  }

  // isNil :: This -> Bool
  isNil() {
    throw new Error('not implemented')
  }

  // isKeyNode :: This -> Bool
  isKeyNode() {
    throw new Error('not implemented')
  }

  // isEntryNode :: This -> Bool
  isEntryNode() {
    throw new Error('not implemented')
  }

  // checkPred :: This -> (Any -> Bool) -> Bool
  checkPred(pred) {
    throw new Error('not implemented')
  }

  [Symbol.iterator]() {
    throw new Error('not implemented')
  }
}

export const assertNode = node =>
  assertInstanceOf(node, Node)

export const assertKeyNode = node => {
  assertNode(node)
  if(!node.isKeyNode())
    throw new TypeError('type of node must be key node')
}

export const assertEntryNode = node => {
  assertNode(node)
  if(!node.isEntryNode())
    throw new TypeError('type of node must be entry node')
}
