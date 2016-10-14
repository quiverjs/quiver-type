import { assertType } from '../core/assert'

import { CompiledExpression } from './expr'

const $func = Symbol('@func')

export class CompiledFunction extends CompiledExpression {
  // constructor :: Function -> Expression -> CompiledType -> ()
  constructor(srcExpr, func) {
    assertType(func, Function)

    super(srcExpr)

    this[$func] = func
  }

  get func() {
    return this[$func]
  }

  call(...args) {
    const { func, compiledType } = this
    return compiledType.directCall(func, ...args)
  }

  unsafeCall(...args) {
    return this.func(...args)
  }
}
