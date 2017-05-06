import { Closure } from './closure'

const $value = Symbol('@value')

export class ValueClosure extends Closure {
  constructor(value) {
    super()
    this[$value] = value
  }

  get value() {
    return this[$value]
  }

  bindValues(closureValues) {
    return this.value
  }

  bindApplyArg(closureValues, arg) {
    throw new Error('cannot apply argument to variable closure')
  }

  bindApplyArgs(closureValues, args) {
    throw new Error('cannot apply arguments to variable closure')
  }
}
