
export const TypeApplicationExpression = ExpressionClass(
class extends Expression {
  constructor(expr, argType) {
    assertType(expr, Expression)
    assertType(type, type)

    assertType(expr.getType(), ForAllType,
      'applied expression must have forall type')

    this[$expr] = expr
    this[$type] = type
  }

  get expr() {
    return this[$expr]
  }

  get type() {
    return this[$type]
  }

  getType(env) {
    const { expr, type } = this
    return expr.getType(env).applyType(type)
  }

  bindTerm(termVar, targetExpr) {
    assertType(termVar, TermVariable)
    assertType(targetExpr, Expression)

    const { expr, type } = this

    if(!expr.freeTermVariables().has(termVar))
      return this

    const newExpr = expr.bindTerm(termVar, targetExpr)
    return new TypeApplicationExpression(newExpr, type)
  }

  bindType(typeVar, targetType) {
    assertType(typeVar, TypeVariable)
    assertType(targetType, Type)

    const { expr, type } = this

    if(!expr.freeTypeVariables.has(typeVar) &&
      !type.freeTypeVariables().has(typeVar))
    {
      return this
    }

    const newExpr = expr.bindType(typeVar, targetType)
    const newType = type.bindType(typeVar, targetType)

    return new TypeApplicationExpression(newExpr, newType)
  }

  reduce() {
    const { expr, type } = this

    const reducedExpr = expr.reduce
    if(reducedExpr === expr) return this

    if(reducedExpr instanceof TypeLambdaExpression) {
      return reducedExpr.applyType(type).reduce()
    } else {
      return new TypeApplication(reducedExpr, type)
    }
  }
})
