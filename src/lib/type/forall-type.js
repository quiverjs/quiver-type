
export const ForAllType = TypeClass(
  class extends Type {
    constructor(typeVar, type) {
      assertType(typeVar, TypeVariable)
      assertType(type, Type)

      this[$typeVar] = typeVar
      this[$type] = type
    }

    get typeVar() {
      return this[$typeVar]
    }

    get type() {
      return this[$type]
    }

    applyType(targetType) {
      assertType(targetType, Type)

      const { typeVar, type } = this

      return type.bindType(typeVar, targetType)
    }

    typeCheck(targetType) {
      assertType(targetType, ForAllType)

      const { typeVar, type } = this

      const innerType = targetType.applyType(
        new VariableType(typeVar))

      type.typeCheck(innerType)
    }
  })
