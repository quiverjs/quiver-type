import { Closure, assertClosure } from './closure'
import { nil, nodeFromValue } from '../container'
import { LambdaValue } from '../value/lambda'
import { assertArrowType } from '../type/arrow'

const $arrowType = Symbol('@arrowType')
const $bodyClosure = Symbol('@bodyClosure')

export class CombinatorClosure extends Closure {
  // constructor :: This -> ArrowType -> Closure -> ()
  constructor(arrowType, bodyClosure) {
    assertArrowType(arrowType)
    assertClosure(bodyClosure)

    this[$arrowType] = arrowType
    this[$bodyClosure] = bodyClosure
  }

  get arrowType() {
    return this[$arrowType]
  }

  get bodyClosure() {
    return this[$bodyClosure]
  }

  bindValues(closureValues) {
    return new LambdaValue(this, nil)
  }

  bindApplyArgs(closureValues, args) {
    if(args.isNil())
      return new LambdaValue(this, nil)

    const { bodyClosure } = this
    const { item, next } = args
    const inClosureValues = nodeFromValue(item)

    return bodyClosure.bindApplyArgs(inClosureValues, next)
  }
}
