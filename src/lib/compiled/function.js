import { assertInstanceOf } from '../core/assert'

import { CompiledArrowType } from '../compiled/arrow'

const $func = Symbol('@func')
const $compiledArrow = Symbol('@compiledArrow')

export class TypedFunction {
  // constructor :: Function -> Term -> CompiledType -> ()
  constructor(compiledArrow, func) {
    assertInstanceOf(compiledArrow, CompiledArrowType)
    assertInstanceOf(func, Function)

    this[$func] = func
    this[$compiledArrow] = compiledArrow
  }

  get func() {
    return this[$func]
  }

  get compiledArrow() {
    return this[$compiledArrow]
  }

  get srcType() {
    return this.compiledArrow.srcType
  }

  call(...args) {
    const { func, compiledArrow } = this
    return compiledArrow.directCall(func, args)
  }

  unsafeCall(...args) {
    return this.func(...args)
  }
}
