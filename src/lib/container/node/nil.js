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

  isKeyNode() {
    return true
  }

  isEntryNode() {
    return true
  }
}

export const nil = new Nil()
