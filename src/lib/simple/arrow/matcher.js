import { ArrowValue } from './arrow'
import { arrow } from '../type/arrow'
import { caseType } from '../type/case'
import { assertNode, cons } from '../container'

const $sumType = Symbol('@sumType')
const $returnType = Symbol('@returnType')
const $recordValue = Symbol('@recordValue')
const $arrowType = Symbol('@arrowType')
const $recordType = Symbol('@recordType')

export class MatcherValue extends ArrowValue {
  constructor(sumType, returnType, recordValue) {
    const arrowType = arrow(sumType, returnType)
    const recordType = caseType(sumType, returnType)

    const err = recordType.checkType(recordValue)
    if(err) throw err

    this[$sumType] = sumType
    this[$returnType] = returnType
    this[$recordValue] = recordValue
    this[$arrowType] = arrowType
    this[$recordType] = recordType
  }

  get sumType() {
    return this[$sumType]
  }

  get returnType() {
    return this[$returnType]
  }

  get recordValue() {
    return this[$recordValue]
  }

  get arrowType() {
    return this[$arrowType]
  }

  get recordType() {
    return this[$recordType]
  }

  $apply(args) {
    assertNode(args)

    if(args.size === 0)
      return this

    const { recordValue } = this

    // item :: VariantValue
    const { item, next } = args
    const { caseIndex, value } = item

    const fieldArrow = recordValue.$get(caseIndex)

    const inArgs = cons(value, next)
    return fieldArrow.$apply(inArgs)
  }
}
