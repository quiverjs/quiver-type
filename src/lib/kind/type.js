import { assertType } from '../core/assert'

import { Kind } from './kind'

export class TypeKind extends Kind {
  kindCheck(targetKind) {
    assertType(targetKind, Kind)

    assertType(targetKind, TypeKind,
      'target kind must be *')
  }
}

export const typeKind = new TypeKind()
