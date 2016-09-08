
class FunctionExpression extends Expression {
  // constructor :: List TermVariable -> List Type -> Type -> Function -> ()
  constructor(argVars, argTypes, returnType, func) {
    assertList(argVars)
    assertList(inputTypes)

    for(const argVar of argVars) {
      assertType(argVar, TermVariable)
    }

    for(const type of argTypes) {
      assertType(type, Type)
    }

    if(argVars.size !== argTypes.size) {
      throw new Error('size of argument variables and types must match')
    }

    assertType(returnType, Type)
    assertFunction(func)

    const inputTypeVars = inputTypes.reduce(
      (set, type) => set.union(type.freeTypeVariables()),
      Set())

    const returnTypeVars = returnType.freeTypeVariables()

    if(!returnTypeVars.isSubset(inputTypeVars)) {
      throw new Error('return type variables must be derived from input type')
    }

    this[$argVars] = argVars
    this[$inputTypes] = inputTypes
    this[$returnType] = returnType
    this[$func] = func
  }

}
