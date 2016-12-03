import { assertInstanceOf, isInstanceOf } from '../core/assert'

import { Kind } from './kind'

export class UnitKind extends Kind {
  kindCheck(targetKind) {
    assertInstanceOf(targetKind, Kind)

    if(targetKind === this) return null

    if(!isInstanceOf(targetKind, UnitKind))
      return new TypeError('target kind must be UnitKind')

    return null
  }

  formatKind() {
    return ['unit-kind']
  }
}

export const unitKind = new UnitKind()
