import { ArrowValue } from './arrow'
import { arrow } from '../type/arrow'
import { caseType } from '../type/case'
import { assertType } from '../type/type'
import { isFunction } from '../../assert'
import { assertSumType } from '../type/sum'
import { typedRecord } from '../value/record'
import { assertNode, cons } from '../../container'
import { arrowFunction } from './constructor'

const $sumType = Symbol('@sumType')
const $returnType = Symbol('@returnType')
const $recordValue = Symbol('@recordValue')
const $arrowType = Symbol('@arrowType')
const $recordType = Symbol('@recordType')

export class MatcherValue extends ArrowValue {
  constructor(sumType, returnType, recordValue) {
    assertSumType(sumType)
    assertType(returnType)

    const arrowType = arrow(sumType, returnType)
    const recordType = caseType(sumType, returnType)

    const err = recordType.checkValue(recordValue)
    if(err) throw err

    super()

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

export const matcherValue = (sumType, returnType, caseFunctions) => {
  const arrowRecord = sumType.typeRecord.mapValues(
    (caseType, caseTag) => {
      const caseFunction = caseFunctions[caseTag]

      if(!isFunction(caseFunction))
        throw new TypeError(`case function ${caseTag} not found in case map`)

      const arrowType = arrow(caseType, returnType)
      return arrowFunction(arrowType, caseFunction)
    })

  const recordType = caseType(sumType, returnType)
  const recordValue = typedRecord(recordType, arrowRecord)

  return new MatcherValue(sumType, returnType, recordValue)
}
