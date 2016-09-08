
export const TypeLambdaExpression = ExpressionClass(
class extends Expression {
  constructor(typeVar, bodyExpr) {
    assertType(typeVar, TypeVariable)
    assertType(bodyExpr, Expression)

    this[$typeVar] = typeVar
    this[$bodyExpr] = expr
  }

  get typeVar() {
    return this[$typeVar]
  }

  get bodyExpr() {
    return this[$bodyExpr]
  }

  getType(env) {
    assertType(env, TypeEnv)

    const { typeVar, bodyExpr } = this
    return new ForAllType(typeVar, bodyExpr.getType(env))
  }

  freeTypeVariables() {
    const { typeVar, bodyExpr } = this

    return bodyExpr.freeTypeVariables()
      .delete(typeVar)
  }

  freeTermVariables() {
    return this.bodyExpr.freeTermVariables()
  }

  bindType(targetTypeVar, type) {
    assertType(targetTypeVar, TypeVariable)
    assertType(type, Type)

    const { typeVar, bodyExpr } = this
    if(targetTypeVar === typeVar) return this

    if(!bodyExpr.freeTypeVariables().has(targetTypeVar))
      return this

    const newBodyExpr = bodyExpr.bindType(targetTypeVar, type)
    return new TypeLambdaExpression(typeVar, newBodyExpr)
  }

  bindTerm(termVar, expr) {
    assertType(termVar, TermVariable)
    assertType(expr, Expression)

    const { typeVar, bodyExpr } = this

    if(!bodyExpr.freeTermVariables().has(termVar))
      return this

    const newBodyExpr = bodyExpr.bindTerm(termVar, expr)
    return new TypeLambdaExpression(typeVar, newBodyExpr)
  }

  applyType(type) {
    assertType(type, Type)

    const { typeVar, bodyExpr } = this
    return bodyExpr.bindType(typeVar, type)
  }

  reduce() {
    const { typeVar, bodyExpr } = this

    const reducedBody = bodyExpr.reduce()
    if(reducedBody === bodyExpr) return this

    return new TypeLambdaExpression(typeVar, reducedBody)
  }
})
