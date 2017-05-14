import { Type, assertType } from './type'
import { assertTypeNode } from './assert'
import { nodesToIter, valueNode } from '../../container'
import {
  assertString, assertFunction, isInstanceOf
} from '../../assert'

const $name = Symbol('@name')
const $subTypes = Symbol('@subType')
const $valueChecker = Symbol('@valueChecker')
const $valueCheckerBuilder = Symbol('@valueCheckerBuilder')

export class CompositeType extends Type {
  // constructor :: This -> String -> Node Type ->
  //                (Node Type -> (Any -> Bool)) -> ()
  constructor(name, subTypes, valueCheckerBuilder) {
    assertString(name)
    assertTypeNode(subTypes)
    assertFunction(valueCheckerBuilder)

    const valueChecker = valueCheckerBuilder(subTypes)
    assertFunction(valueChecker)

    super()

    this[$name] = name
    this[$subTypes] = subTypes
    this[$valueChecker] = valueChecker
    this[$valueCheckerBuilder] = valueCheckerBuilder
  }

  get typeName() {
    return this[$name]
  }

  get subTypes() {
    return this[$subTypes]
  }

  get valueChecker() {
    return this[$valueChecker]
  }

  get valueCheckerBuilder() {
    return this[$valueCheckerBuilder]
  }

  checkType(targetType) {
    assertType(targetType)

    if(!isInstanceOf(targetType, CompositeType))
      return new TypeError('target type must be a composite type')

    const { typeName, subTypes } = this

    if(typeName !== targetType.typeName)
      return new TypeError('target composite type have different name')

    const subTypes2 = targetType.subTypes
    if(subTypes.size !== subTypes2.size)
      return new TypeError('target composite type have different sub types')

    for(const [type1, type2] of nodesToIter(
        subTypes, subTypes2))
    {
      const err = type1.checkType(type2)
      if(err) return err
    }

    return null
  }

  checkValue(value) {
    const { subTypes, valueChecker } = this
    return valueChecker(value)
  }

  formatType() {
    const { typeName, subTypes } = this
    const subTypesRep = [...subTypes].map(
      subType => subType.formatType())

    return ['composite-type', typeName, subTypesRep]
  }
}

export const compositeType = (name, subTypes, valueCheckerBuilder) =>
  new CompositeType(name, subTypes, valueCheckerBuilder)

export const compositeTypeBuilder = (name, valueCheckerBuilder) => {
  assertString(name)
  assertFunction(valueCheckerBuilder)

  return subTypes =>{
    assertTypeNode(subTypes)
    return new CompositeType(name, subTypes, valueCheckerBuilder)
  }
}

export const simpleCompositeTypeBuilder = (name, valueCheckerBuilder) => {
  const wrappedBuilder = subTypes => {
    const [subType] = subTypes
    return valueCheckerBuilder(subType)
  }

  return subType => {
    assertType(subType)
    const subTypes = valueNode(subType)

    return new CompositeType(name, subTypes, wrappedBuilder)
  }
}
