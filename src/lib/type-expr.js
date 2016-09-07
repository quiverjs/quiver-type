
/*
data TypeExpression
  = TypeConstant Type
  | TypeLambda Type TermLambda
  | TypeConstruction TypeExpression TypeExpression
  | TypeApplication TypeLambda Type
*/

class TypeExpression extends Expression {
  // getType :: () -> Type
  getType() {

  }
}

class VariableTypeExpression extends TypeExpression {
  constructor(typeVar) {
    if(!typeVariable instanceof TypeVariable)
      throw new TypeError('typeVar must be instance of TypeVariable')

    this[$typeVar] = typeVar
  }

  freeTypeVariable() {
    return ImmutableSet().add(this[$typeVar])
  }

  applyType(typeExpr) {
    throw new TypeError('VariableTypeExpression cannot be applied type')
  }
}

class TypeLambda extends TypeExpression {

}

class TypeApplication extends TypeExpression {

}

class TypeLiteral extends TypeExpression {

}
