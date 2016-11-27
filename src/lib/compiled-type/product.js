import { IList } from '../core/container'
import { assertListContent } from '../core/assert'

import { CompiledType } from './type'

const $elementTypes = Symbol('@elementTypes')

export class CompiledProductType extends CompiledType {
  constructor(srcType, elementTypes) {
    assertListContent(elementTypes, CompiledType)

    super(srcType)

    this[$elementTypes] = elementTypes
  }

  get elementTypes() {
    return this[$elementTypes]
  }

  typeCheck(valueList) {
    if(!IList.isList(valueList))
      return new TypeError('value list must be immutable list')

    const { elementTypes } = this

    if(valueList.size !== elementTypes.size)
      return new TypeError('value list size mismatch')

    for(const [elementType, value] of elementTypes.zip(valueList)) {
      const err = elementType.typeCheck(value)
      if(err) return err
    }

    return null
  }
}
