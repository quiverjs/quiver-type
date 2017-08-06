import { Closure } from './closure'
import { getItem } from '../../container'

const $argIndex = Symbol('@argIndex')

export class VariableClosure extends Closure {
  // constructor :: This -> Nat -> ()
  constructor(argIndex) {
    super()
    this[$argIndex] = argIndex
  }

  get argIndex() {
    return this[$argIndex]
  }

  bindValues(closureValues) {
    const { argIndex } = this
    return getItem(closureValues, argIndex)
  }

  bindApplyArgs(closureValues, args) {
    throw new Error('cannot apply arguments to variable closure')
  }
}

export class ArrowVariableClosure extends VariableClosure {
  bindApplyArgs(closureValues, args) {
    return this
      .bindValues(closureValues)
      .$apply(args)
  }
}
