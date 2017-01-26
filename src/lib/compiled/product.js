import { IMap, IList } from '../core/container'
import {
  assertInstanceOf, assertString,
  assertMap, assertListContent
} from '../core/assert'

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

export class CompiledRecordType extends CompiledType {
  constructor(srcType, elementTypes) {
    assertMap(elementTypes)
    for(const [key, elementType] of elementTypes.entries()) {
      assertString(key)
      assertInstanceOf(elementType, CompiledType)
    }

    super(srcType)

    this[$elementTypes] = elementTypes
  }

  get elementTypes() {
    return this[$elementTypes]
  }

  typeCheck(valueMap) {
    if(!IMap.isMap(valueMap))
      return new TypeError('value list must be immutable map')

    const { elementTypes } = this

    if(valueMap.size !== elementTypes.size)
      return new TypeError('value list size mismatch')

    for(const [key, elementType] of elementTypes.entries()) {
      if(!valueMap.has(key))
        return new TypeError(`missing field ${key} in value map`)

      const value = valueMap.get(key)
      const err = elementType.typeCheck(value)
      if(err) return err
    }

    return null
  }
}
