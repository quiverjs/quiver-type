import { Kind } from '../kind/kind'
import { formatLisp } from '../core/util'
import { unionMap } from '../core/container'
import {
  assertKeyword,
  assertInstanceOf
} from '../core/assert'

export class Type {
  constructor() {
    if(this.constructor === Type)
      throw new Error('abstract class Type cannot be instantiated')
  }

  subTypes() {
    throw new Error('Not implemented')
  }

  map(typeMapper) {
    throw new Error('Not implemented')
  }

  freeTypeVariables() {
    return this.subTypes()::unionMap(
      subTerm => subTerm.freeTypeVariables())
  }

  // typeCheck :: Type -> Maybe Error
  typeCheck(targetType) {
    throw new Error('Not implemented')
  }

  validateTVarKind(typeVar, kind) {
    assertKeyword(typeVar)
    assertInstanceOf(kind, Kind)

    for (const subType of this.subTypes()) {
      const err = subType.validateTVarKind(typeVar, kind)
      if(err) return err
    }

    return null
  }

  bindType(typeVar, type) {
    assertKeyword(typeVar)
    assertInstanceOf(type, Type)

    return this.map(
      subType => subType.bindType(typeVar, type))
  }

  // typeKind :: () -> Kind
  typeKind() {
    throw new Error('Not implemented')
  }

  // compileType :: () -> CompiledType
  compileType() {
    throw new Error('Not implemented')
  }

  // formatType :: () -> String
  formatType() {
    throw new Error('Not implemented')
  }

  inspect() {
    return formatLisp(this.formatType())
  }
}
