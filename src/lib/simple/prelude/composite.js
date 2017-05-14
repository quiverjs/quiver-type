import { isArray } from '../../assert'
import { isNode } from '../../container'
import { simpleCompositeTypeBuilder } from '../type/composite'

export const buildArrayType = simpleCompositeTypeBuilder(
  'Array',
  elementType => array => {
    if(!isArray(array))
      return new TypeError('argument must be array')

    for(const element of array) {
      const err = elementType.checkValue(element)
      if(err) return err
    }

    return null
  })

export const buildNodeType = simpleCompositeTypeBuilder(
  'Node',
  elementType => {
    const isType = element =>
      !elementType.checkValue(element)

    return node => {
      if(!isNode(node))
        return new TypeError('argument must be instance of Node')

      if(!node.checkPred(isType))
        return new TypeError(`elements of node must be of type ${elementType}`)

      return null
    }
  })
