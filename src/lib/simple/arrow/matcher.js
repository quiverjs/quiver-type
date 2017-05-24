import { ArrowValue } from './arrow'
import { arrow } from '../type/arrow'
import { isFunction } from '../../assert'
import { typedRecord } from '../value/record'
import { assertNode, cons } from '../../container'
import { arrowFunction } from './constructor'
import {
  caseType as makeCaseType,
  assertCaseType
} from '../type/case'

const $caseType = Symbol('@caseType')
const $recordValue = Symbol('@recordValue')

export class MatcherValue extends ArrowValue {
  constructor(caseType, recordValue) {
    assertCaseType(caseType)

    const err = caseType.checkValue(recordValue)
    if(err) throw err

    super()

    this[$caseType] = caseType
    this[$recordValue] = recordValue
  }

  get caseType() {
    return this[$caseType]
  }

  get recordValue() {
    return this[$recordValue]
  }

  get arrowType() {
    const { caseType } = this
    return caseType.arrowType
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

  const caseType = makeCaseType(sumType, returnType)
  const recordValue = typedRecord(caseType, arrowRecord)

  return new MatcherValue(caseType, recordValue)
}
