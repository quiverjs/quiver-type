import { iterToNode } from '../../container'
import { checkArgs, checkPartialArgs } from './args'
import { isInstanceOf, assertInstanceOf } from '../../assert'

export class ArrowValue {
  constructor() {
    if(this.constructor === ArrowValue)
      throw new Error('abstract class Value cannot be instantiated')
  }

  // arrowType :: This -> ArrowType
  get arrowType() {
    throw new Error('not implemented')
  }

  // $apply :: Node Any -> Any
  $apply(args) {
    throw new Error('not implemented')
  }

  // apply :: Array Any -> Any
  apply(...args) {
    const { arrowType } = this
    const inArgs = iterToNode(args)
    checkArgs(arrowType, inArgs)
    return this.$apply(inArgs)
  }

  // applyPartial :: Array Any -> Any
  applyPartial(...args) {
    if(args.length === 0)
      return this

    const { arrowType } = this
    const inArgs = iterToNode(args)
    checkPartialArgs(arrowType, inArgs)
    return this.$apply(inArgs)
  }
}

export const isArrowValue = arrowValue =>
  isInstanceOf(arrowValue, ArrowValue)

export const assertArrowValue = arrowValue =>
  assertInstanceOf(arrowValue, ArrowValue)
