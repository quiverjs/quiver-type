import { LambdaValue } from '../arrow/lambda'
import { cons, assertNode } from '../../container'
import { assertArrowType } from '../type/arrow'
import { Closure, assertClosure } from './closure'

const $arrowType = Symbol('@arrowType')
const $bodyClosure = Symbol('@bodyClosure')

export class LambdaClosure extends Closure {
  // constructor :: This -> ArrowType -> Closure -> ()
  constructor(arrowType, bodyClosure) {
    assertArrowType(arrowType)
    assertClosure(bodyClosure)

    super()

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

    const { bodyClosure } = this
    const { item, next } = args
    const inClosureValues = cons(item, closureValues)

    if(next.isNil()) {
      return bodyClosure.bindValues(inClosureValues)
    } else {
      return bodyClosure.bindApplyArgs(inClosureValues, next)
    }
  }
}
