import { LambdaValue } from '../value/lambda'
import { cons, assertNode } from '../container'
import { assertArrowType } from '../type/arrow'
import { Closure, assertClosure } from './closure'

const $arrowType = Symbol('@arrowType')
const $bodyClosure = Symbol('@bodyClosure')

export class LambdaClosure extends Closure {
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
    assertNode(closureValues)
    return new LambdaValue(this, closureValues)
  }

  bindApplyArgs(closureValues, args) {
    assertNode(closureValues)
    assertNode(args)

    if(args.isNil())
      return this.bindValues(closureValues)

    const { bodyClosure } = this
    const { item, next } = args
    const inClosureValues = cons(item, closureValues)

    return bodyClosure.bindApplyArgs(inClosureValues, next)
  }
}
