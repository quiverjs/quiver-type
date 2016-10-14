import { emptyEnv } from '../core/env'
import { assertType } from '../core/assert'
import { Expression } from '../expr/expression'

const $srcExpr = Symbol('@srcExpr')
const $srcType = Symbol('@srcType')
const $compiledType = Symbol('@compiledType')

export class CompiledExpression {
  constructor(srcExpr) {
    if(this.constructor === CompiledExpression)
      throw new Error('Abstract class Expression cannot be instantiated')

    assertType(srcExpr, Expression)

    const srcType = srcExpr.exprType(emptyEnv)
    const compiledType = srcType.compileType()

    this[$srcExpr] = srcExpr
    this[$srcType] = srcType
    this[$compiledType] = compiledType
  }

  get srcExpr() {
    return this[$srcExpr]
  }

  get srcType() {
    return this[$srcType]
  }

  get compiledType() {
    return this[$compiledType]
  }
}
