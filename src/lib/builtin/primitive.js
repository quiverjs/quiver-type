import { LiteralType } from '../type/literal'

export const NumberType = new LiteralType(
  'Number',
  num => {
    if(typeof(num) !== 'number') {
      return new TypeError('argument must be number')
    }
  })

export const IntegerType = new LiteralType(
  'Integer',
  int => {
    if(typeof(int) !== 'number' || (int|0) !== int) {
      return new TypeError('argument must be integer')
    }
  }
)

export const StringType = new LiteralType(
  'String',
  str => {
  if(typeof(str) !== 'string') {
    return new TypeError('argument must be string')
  }
})

export const BooleanType = new LiteralType(
  'Boolean',
  bool => {
    if(typeof(bool) !== 'boolean') {
      return new TypeError('argument must be boolean')
    }
  })

export const ObjectType = new LiteralType(
  'Object',
  obj => {
    if(typeof(obj) !== 'object') {
      return new TypeError('argument must be an object')
    }
  }
)
