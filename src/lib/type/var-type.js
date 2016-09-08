
class VariableType extends Type {
  constructor(typeVar) {
    assertType(typeVar, TypeVariable,
      'typeVar must be TypeVariable')

    this[$typeVar] = typeVar
  }

  get typeVariable() {
    return this[$typeVar]
  }

  freeTypeVariable() {
    return Set([this.typeVariable])
  }

  typeCheck(env, target) {
    return lookupEnv(env, this.typeVariable).typeCheck(env, target)
  }
}
