const $metadata = Symbol('@metadata')

export class Node {
  constructor() {
    if(this.constructor === Node)
      throw new Error('Abstract class Closure cannot be instantiated')

    this[$metadata] = Object.create(null)
  }

  // item :: () -> Error Any
  get item() {
    throw new Error('not implemented')
  }

  // next :: () -> Error Node
  get next() {
    throw new Error('not implemented')
  }

  // size :: () -> Nat
  get size() {
    throw new Error('not implemented')
  }

  // metadata :: () -> Object
  get metadata() {
    return this[$metadata]
  }

  // isNil :: () -> Bool
  isNil() {
    throw new Error('not implemented')
  }

  // isKeyNode :: () -> Bool
  isKeyNode() {
    throw new Error('not implemented')
  }

  // isEntryNode :: () -> Bool
  isEntryNode() {
    throw new Error('not implemented')
  }
}
