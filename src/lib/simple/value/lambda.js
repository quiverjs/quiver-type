import { iterToNode } from '../container'
import { ArrowValue } from './arrow'

const $lambdaClosure = Symbol('@lambdaClosure')
const $closureValues = Symbol('@closureValues')
const $arrowType = Symbol('@arrowType')

export class LambdaValue extends ArrowValue {
  // constructor :: This -> LambdaClosure -> Node -> ()
  constructor(lambdaClosure, closureValues) {
    const { arrowType } = lambdaClosure

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

    const err = arrowType.checkArgs(args)
    if(err) throw err

    return lambdaClosure.bindApplyArgs(closureValues, args)
  }

  partialApply(...argsArray) {
    const args = iterToNode(argsArray)
    const { lambdaClosure, closureValues, arrowType } = this

    const err = arrowType.checkPartialArgs(args)
    if(err) throw err

    return lambdaClosure.bindApplyArgs(closureValues, args)
  }

  rawApply(...argsArray) {
    const args = iterToNode(argsArray)
    const { lambdaClosure, closureValues } = this
    return lambdaClosure.bindApplyArgs(closureValues, args)
  }
}
