import { isType } from '../type/type'
import { typedTuple } from '../value/tuple'
import { productType } from '../type/product'
import { variantValue } from '../value/variant'
import { objectEntries } from '../../container'
import { assertSumType, sumTypeFromEntries } from '../type/sum'

const adtObjectToTypeEntries = function*(adtObject) {
  for(const [key, value] of objectEntries(adtObject)) {
    if(isType(value)) {
      yield [key, value]
    } else if(Array.isArray(value)) {
      const type = productType(...value)
      yield [key, type]
    } else {
      throw new TypeError('ADT fields must be either type or array of types')
    }
  }
}

export const abstractDataType = adtObject => {
  return sumTypeFromEntries(adtObjectToTypeEntries(adtObject))
}

export const adtValue = (type, caseTag, value) => {
  assertSumType(type)

  if(Array.isArray(value)) {
    const caseType = type.getCaseType(caseTag)
    const tuple = typedTuple(caseType, ...value)
    return variantValue(type, caseTag, tuple)
  } else {
    return variantValue(type, caseTag, value)
  }
}
