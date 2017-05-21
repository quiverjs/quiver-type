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

  get length() {
    return this.size
  }

  // isNode :: This -> Bool
  get isNode() {
    return true
  }

  // isNil :: This -> Bool
  isNil() {
    throw new Error('not implemented')
  }

  // checkPred :: This -> (Any -> Bool) -> Bool
  checkPred(pred) {
    throw new Error('not implemented')
  }

  [Symbol.iterator]() {
    throw new Error('not implemented')
  }

  inspect() {
    return this.toString()
  }
}
