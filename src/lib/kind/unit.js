import { assertType } from '../core/assert'

import { Kind } from './kind'

export class UnitKind extends Kind {
  kindCheck(targetKind) {
    assertType(targetKind, Kind)

    // console.trace('kindCheck', this.formatKind(), targetKind.formatKind())

    assertType(targetKind, UnitKind,
      'target kind must be *')
  }

  formatKind() {
    return ['unit-kind']
  }
}

export const unitKind = new UnitKind()
