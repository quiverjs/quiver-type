import { assertType } from '../core/assert'

import { Kind } from './kind'

export class TypeKind extends Kind {
  kindCheck(targetKind) {
    assertType(targetKind, Kind)

    // console.trace('kindCheck', this.formatKind(), targetKind.formatKind())

    assertType(targetKind, TypeKind,
      'target kind must be *')
  }

  formatKind() {
    return ['kind', '*']
  }
}

export const typeKind = new TypeKind()
