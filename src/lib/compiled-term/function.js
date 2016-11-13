import { assertType } from '../core/assert'

import { CompiledTerm } from './term'

const $func = Symbol('@func')

export class CompiledFunction extends CompiledTerm {
  // constructor :: Function -> Term -> CompiledType -> ()
  constructor(srcTerm, func) {
    assertType(func, Function)

    super(srcTerm)

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
