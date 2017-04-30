import { assertInstanceOf } from '../core/assert'

import { FixedPointType } from '../type/fixed'

import { CompiledType } from './type'

export const $setConcrete = Symbol('@concreteType')
const $concreteType = Symbol('@concreteType')

export class CompiledFixedType extends CompiledType {
  constructor(srcType) {
    assertInstanceOf(srcType, FixedPointType)
    super(srcType)

    this[$concreteType] = null
  }

  unfold() {
    const concreteType = this[$concreteType]

    if(!concreteType) {
      throw new Error('concrete type is not yet set')
    }

    return concreteType
  }

  [$setConcrete](concreteType) {
    assertInstanceOf(concreteType, CompiledType)

    if(this[$concreteType]) {
      throw new Error('concrete type is already set')
    }

    this[$concreteType] = concreteType
  }

  typeCheck(object) {
    return this.unfold().typeCheck(object)
  }
}
