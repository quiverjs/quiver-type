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

  bindApplyArgs(closureValues, args) {
    throw new Error('cannot apply arguments to variable closure')
  }
}

export class ArrowValueClosure extends ValueClosure {
  bindApplyArgs(closureValues, args) {
    const { value } = this
    return value.applyRaw(...args)
  }
}
