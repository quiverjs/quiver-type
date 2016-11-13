import { assertInstanceOf } from '../core/assert'

import { Kind } from './kind'

export class UnitKind extends Kind {
  kindCheck(targetKind) {
    assertInstanceOf(targetKind, Kind)

    // console.trace('kindCheck', this.formatKind(), targetKind.formatKind())

    assertInstanceOf(targetKind, UnitKind,
      'target kind must be *')
  }

  formatKind() {
    return ['unit-kind']
  }
}

export const unitKind = new UnitKind()
