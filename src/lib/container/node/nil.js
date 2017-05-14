import { Node } from './node'

export class Nil extends Node {
  get item() {
    throw new Error('cannot get item from Nil Node')
  }

  get next() {
    throw new Error('cannot get next from Nil Node')
  }

  get size() {
    return 0
  }

  isNil() {
    return true
  }

  checkPred(pred) {
    return true
  }

  *values() {
    // noop
  }

  *[Symbol.iterator]() {
    // noop
  }

  toString() {
    return 'nil'
  }
}

export const nil = new Nil()
