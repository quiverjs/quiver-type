export class Type {
  constructor() {
    if(this.constructor === Type)
      throw new Error('abstract class Type cannot be instantiated')
  }

  // freeTypeVariable :: () -> Set TypeVariable
  freeTypeVariables() {
    throw new Error('Not implemented')
  }

  // typeCheck :: Type -> Maybe Error
  typeCheck(targetType) {
    throw new Error('Not implemented')
  }

  // validateTVarKind :: TypeVariable -> Kind -> MaybeError
  validateTVarKind(typeVar, kind) {
    throw new Error('not implemented')
  }

  // bindType :: TypeVariable -> Type -> Type
  bindType(typeVar, type) {
    throw new Error('Not implemented')
  }

  // typeKind :: () -> Kind
  typeKind() {
    throw new Error('Not implemented')
  }

  // compileType :: () -> CompiledType
  compileType() {
    throw new Error('Not implemented')
  }

  // isTerminal :: Bool
  // Terminal type allows type application to proceed,
  // similar to eager evaluation in term lambda application.
  isTerminal() {
    throw new Error('Not implemented')
  }
}
