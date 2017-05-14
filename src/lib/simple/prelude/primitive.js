import { primitiveType } from '../type/primitive'
import {
  isNumber,
  isInteger,
  isNat,
  isString,
  isSymbol,
  isKeyword,
  isBoolean,
  isObject,
} from '../../assert'

export const NumberType = primitiveType(
  'Number',
  num => {
    if(!isNumber(num))
      return new TypeError('argument must be number')

    return null
  })

export const IntegerType = primitiveType(
  'Integer',
  int => {
    if(!isInteger(int))
      return new TypeError('argument must be integer')

    return null
  })

export const IntType = IntegerType

export const NatType = primitiveType(
  'Nat',
  nat => {
    if(!isNat(nat))
      return new TypeError('argument must be natural number')

    return null
  })

export const StringType = primitiveType(
  'String',
  string => {
    if(!isString(string))
      return new TypeError('argument must be string')

    return null
  })

export const SymbolType = primitiveType(
  'Symbol',
  symbol => {
    if(!isSymbol(symbol))
      return new TypeError('argument must be symbol')

    return null
  })

export const KeywordType = primitiveType(
  'Keyword',
  keyword => {
    if(!isKeyword(keyword))
      return new TypeError('argument must be either string or symbol')

    return null
  })

export const BooleanType = primitiveType(
  'Boolean',
  bool => {
    if(!isBoolean(bool))
      return new TypeError('argument must be boolean')

    return null
  })

export const ObjectType = primitiveType(
  'Object',
  object => {
    if(!isObject(object))
      return new TypeError('argument must be an object')

    return null
  })

export const AnyType = primitiveType(
  'Any',
  object => null)
