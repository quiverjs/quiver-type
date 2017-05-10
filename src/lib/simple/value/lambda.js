import { ArrowValue } from './arrow'
import { iterToNode } from '../container'
import { checkArgs, checkPartialArgs } from '../util/args'

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

  apply(...argsArray) {
    const args = iterToNode(argsArray)
    const { lambdaClosure, closureValues, arrowType } = this

    checkArgs(arrowType, args)

    return lambdaClosure.bindApplyArgs(closureValues, args)
  }

  applyPartial(...argsArray) {
    const args = iterToNode(argsArray)
    const { lambdaClosure, closureValues, arrowType } = this

    checkPartialArgs(arrowType, args)

    return lambdaClosure.bindApplyArgs(closureValues, args)
  }

  applyRaw(...argsArray) {
    const args = iterToNode(argsArray)
    const { lambdaClosure, closureValues } = this
    return lambdaClosure.bindApplyArgs(closureValues, args)
  }
}
