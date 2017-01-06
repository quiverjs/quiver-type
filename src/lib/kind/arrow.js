import { assertInstanceOf, isInstanceOf } from '../core/assert'

import { Kind } from './kind'

const $leftKind = Symbol('@leftKind')
const $rightKind = Symbol('@rightKind')

export class ArrowKind extends Kind {
  constructor(leftKind, rightKind) {
    assertInstanceOf(leftKind, Kind)
    assertInstanceOf(rightKind, Kind)

    super()

    this[$leftKind] = leftKind
    this[$rightKind] = rightKind
  }

  get leftKind() {
    return this[$leftKind]
  }

  get rightKind() {
    return this[$rightKind]
  }

  kindCheck(targetKind) {
    assertInstanceOf(targetKind, Kind)

    if(targetKind === this) return null

    if(!isInstanceOf(targetKind, ArrowKind))
      return new TypeError('target kind must be arrow kind')

    const { leftKind, rightKind } = this

    const err = leftKind.kindCheck(targetKind.leftKind)
    if(err) return err

    return rightKind.kindCheck(targetKind.rightKind)
  }

  formatKind() {
    const { leftKind, rightKind } = this

    const leftRep = leftKind.formatKind()
    const rightRep = rightKind.formatKind()

    return ['arrow-kind', leftRep, rightRep]
  }
}

export const arrowKind = (...argKinds) => {
  if(argKinds.length < 2) {
    throw new TypeError('arrow kinds must have at least 2 arg kinds')
  }

  const rightKind = argKinds[argKinds.length-1]
  const restKinds = argKinds.slice(0, -1)

  return restKinds.reduceRight(
    (rightKind, leftKind) => {
      return new ArrowKind(leftKind, rightKind)
    }, rightKind)
}
