import { assertType } from '../core/assert'

import { Kind } from './kind'

const $leftKind = Symbol('@leftKind')
const $rightKind = Symbol('@rightKind')

export class ArrowKind extends Kind {
  constructor(leftKind, rightKind) {
    assertType(leftKind, Kind)
    assertType(rightKind, Kind)

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
    assertType(targetKind, Kind)

    assertType(targetKind, ArrowKind,
      'target kind must be arrow kind')

    const { leftKind, rightKind } = this

    const err = leftKind.kindCheck(targetKind.leftKind)
    if(err) return err

    return rightKind.kindCheck(targetKind.rightKind)
  }
}
