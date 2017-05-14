import { isInstanceOf, assertInstanceOf } from '../../assert'

export class Closure {
  constructor() {
    if(this.constructor === Closure)
      throw new Error('Abstract class Closure cannot be instantiated')
  }

  // bindValues :: Node -> Any
  bindValues(closureValues) {
    throw new Error('not implemented')
  }

  // bindAndApply :: Node -> Node -> Any
  bindApplyArgs(closureValues, args) {
    throw new Error('not implemented')
  }
}

export const isClosure = closure =>
  isInstanceOf(closure, Closure)

export const assertClosure = closure =>
  assertInstanceOf(closure, Closure)
