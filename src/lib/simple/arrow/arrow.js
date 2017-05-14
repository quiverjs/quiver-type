import { isInstanceOf, assertInstanceOf } from '../../assert'

export class ArrowValue {
  constructor() {
    if(this.constructor === ArrowValue)
      throw new Error('abstract class Value cannot be instantiated')
  }

  apply(...args) {
    throw new Error('not implemented')
  }

  applyPartial(...args) {
    throw new Error('not implemented')
  }

  applyRaw(...args) {
    throw new Error('not implemented')
  }
}

export const isArrowValue = arrowValue =>
  isInstanceOf(arrowValue, ArrowValue)

export const assertArrowValue = arrowValue =>
  assertInstanceOf(arrowValue, ArrowValue)
