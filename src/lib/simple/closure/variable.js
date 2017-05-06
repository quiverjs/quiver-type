import { Closure } from './closure'
import { getItem } from '../container'

const $argIndex = Symbol('@argIndex')

export class VariableClosure extends Closure {
  // constructor :: This -> Nat -> ()
  constructor(argIndex) {
    super()
    this[$argIndex] = argIndex
  }

  bindValues(closureValues) {
    const { argIndex } = this
    return getItem(closureValues, argIndex)
  }

  bindApplyArg(closureValues, arg) {
    throw new Error('cannot apply argument to variable closure')
  }

  bindApplyArgs(closureValues, args) {
    throw new Error('cannot apply arguments to variable closure')
  }
}
