import { Closure } from './closure'
import { LambdaValue } from '../value/lambda'
import { cons } from '../container'

const $arrowType = Symbol('@arrowType')
const $bodyClosure = Symbol('@bodyClosure')

export class LambdaClosure extends Closure {
  // constructor :: This -> ArrowType -> Closure -> ()
  constructor(arrowType, bodyClosure) {
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
    return new LambdaValue(this, closureValues)
  }

  bindApplyArgs(closureValues, args) {
    if(args.isNil())
      return this.bindValues(closureValues)

    const { bodyClosure } = this
    const { item, next } = args
    const inClosureValues = cons(item, closureValues)

    return bodyClosure.bindApplyArgs(inClosureValues, next)
  }
}
