import { Closure } from './closure'
import { assertNode } from '../../container'
import { assertArrowValue } from '../arrow/arrow'

const $value = Symbol('@value')

export class ValueClosure extends Closure {
  constructor(value) {
    super()
    this[$value] = value
  }

  get value() {
    return this[$value]
  }

  bindValues(values) {
    assertNode(values)
    return this.value
  }

  bindApplyArgs(values, args) {
    assertNode(values)
    assertNode(args)

    throw new Error('cannot apply arguments to variable closure')
  }
}

export class ArrowValueClosure extends ValueClosure {
  constructor(value) {
    assertArrowValue(value)
    super(value)
  }

  bindApplyArgs(values, args) {
    assertNode(values)
    assertNode(args)

    const { value } = this
    return value.$apply(args)
  }
}
