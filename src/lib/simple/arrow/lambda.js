import { ArrowValue } from './arrow'
import { assertNode } from '../../container'

const $lambdaClosure = Symbol('@lambdaClosure')
const $closureValues = Symbol('@closureValues')
const $arrowType = Symbol('@arrowType')

export class LambdaValue extends ArrowValue {
  // constructor :: This -> LambdaClosure -> Node -> ()
  constructor(lambdaClosure, closureValues) {
    const { arrowType } = lambdaClosure

    super()

    this[$lambdaClosure] = lambdaClosure
    this[$closureValues] = closureValues
    this[$arrowType] = arrowType
  }

  get lambdaClosure() {
    return this[$lambdaClosure]
  }

  get closureValues() {
    return this[$closureValues]
  }

  get arrowType() {
    return this[$arrowType]
  }

  $apply(args) {
    assertNode(args)
    const { lambdaClosure, closureValues } = this
    return lambdaClosure.bindApplyArgs(closureValues, args)
  }
}
