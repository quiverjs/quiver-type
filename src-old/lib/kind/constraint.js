import { assertInstanceOf, isInstanceOf } from '../core/assert'

import { Kind } from './kind'

export class ConstraintKind extends Kind {
  kindCheck(targetKind) {
    assertInstanceOf(targetKind, Kind)

    if(targetKind === this) return null

    if(!isInstanceOf(targetKind, ConstraintKind))
      return new TypeError('target kind must be ConstraintKind')

    return null
  }

  formatKind() {
    return ['constraint-kind']
  }
}

export const constraintKind = new ConstraintKind()
