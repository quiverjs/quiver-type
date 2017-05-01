import { assertArrowType } from './arrow'
import { assertFunction, assertNoError } from '../common/assert'

const $func = Symbol('@func')
const $type = Symbol('@type')

export class ArrowFunction {
  constructor(func, type) {
    assertFunction(func)
    assertArrowType(type)

    this[$func] = func
    this[$type] = type
  }

  get func() {
    return this[$func]
  }

  get type() {
    return this[$type]
  }

  safeCall(...args) {
    const { func, type } = this

    if(args.length === 0)
      throw new Error('argument size mismatch')

    const err = type.checkArgs(...args)
    assertNoError(err)

    return func(...args)
  }

  unsafeCall(...args) {
    const { func } = this
    return func(...args)
  }
}
