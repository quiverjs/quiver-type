import { literalType } from '../dsl'

export const NumberType = literalType(
  'Number',
  num => {
    if(typeof(num) !== 'number') {
      return new TypeError('argument must be number')
    }
  })

export const IntegerType = literalType(
  'Integer',
  int => {
    if(typeof(int) !== 'number' || (int|0) !== int) {
      return new TypeError('argument must be integer')
    }
  })

export const StringType = literalType(
  'String',
  str => {
  if(typeof(str) !== 'string') {
    return new TypeError('argument must be string')
  }
})

export const BooleanType = literalType(
  'Boolean',
  bool => {
    if(typeof(bool) !== 'boolean') {
      return new TypeError('argument must be boolean')
    }
  })

export const ObjectType = literalType(
  'Object',
  obj => {
    if(typeof(obj) !== 'object') {
      return new TypeError('argument must be an object')
    }
  })

export const AnyType = literalType(
  'Any',
  () => null)
