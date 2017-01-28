import { Kind } from '../kind/kind'
import { formatLisp } from '../core/util'
import { TypeVariable } from '../core/variable'
import { assertInstanceOf } from '../core/assert'

export class Type {
  constructor() {
    if(this.constructor === Type)
      throw new Error('abstract class Type cannot be instantiated')
  }

  // freeTypeVariable :: () -> ISet TypeVariable
  freeTypeVariables() {
    throw new Error('Not implemented')
  }

  subTerms() {
    throw new Error('Not implemented')
  }

  subTypes() {
    throw new Error('Not implemented')
  }

  map(typeMapper) {
    throw new Error('Not implemented')
  }

  // typeCheck :: Type -> Maybe Error
  typeCheck(targetType) {
    throw new Error('Not implemented')
  }

  validateTVarKind(typeVar, kind) {
    assertInstanceOf(typeVar, TypeVariable)
    assertInstanceOf(kind, Kind)

    for (const subType of this.subTypes()) {
      const err = subType.validateTVarKind(typeVar, kind)
      if(err) return err
    }

    return null
  }

  bindType(typeVar, type) {
    assertInstanceOf(typeVar, TypeVariable)
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
