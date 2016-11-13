import { assertType } from '../core/assert'
import { Term } from '../term/term'

const $srcTerm = Symbol('@srcTerm')
const $srcType = Symbol('@srcType')
const $compiledType = Symbol('@compiledType')

export class CompiledTerm {
  constructor(srcTerm) {
    if(this.constructor === CompiledTerm)
      throw new Error('Abstract class Term cannot be instantiated')

    assertType(srcTerm, Term)

    const srcType = srcTerm.termType()
    const compiledType = srcType.compileType()

    this[$srcTerm] = srcTerm
    this[$srcType] = srcType
    this[$compiledType] = compiledType
  }

  get srcTerm() {
    return this[$srcTerm]
  }

  get srcType() {
    return this[$srcType]
  }

  get compiledType() {
    return this[$compiledType]
  }
}
