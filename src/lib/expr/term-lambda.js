
export class LambdaExpression extends Expression {
  // constructor :: TermVariable -> Type -> Expression -> ()
  constructor(argVar, argType, bodyExpr) {
    assertType(argVar, TermVariable)
    assertType(argType, Type)
    assertType(bodyExpr, Expression)

    this[$argVar] = argVar
    this[$argType] = argType
    this[$bodyExpr] = bodyExpr
  }

  get argVar() {
    return this[$argVar]
  }

  get argType() {
    return this[$argType]
  }

  get bodyExpr() {
    return this[$bodyExpr]
  }

  getType(env) {
    assertType(env, TypeEnv)

    const { argVar, argType, bodyExpr } = this

    const inEnv = env.set(argVar, argType)
    const bodyType = bodyExpr.getType(inEnv)

    return new ArrowType(argType, bodyType)
  }

  freeTermVariables() {
    const { argVar, bodyExpr } = this
    return bodyExpr.freeTermVariables()
      .delete(argVar)
  }

  freeTypeVariables() {
    const { argType, bodyExpr } = this
    return bodyExpr.freeTypeVariables()
      .union(argType.freeTypeVariables())
  }

  // bindTermVariable :: TermVariable -> Expression
  bindTermVariable(termVar, expr) {
    assertType(termVar, TermVariable)
    assertType(expr, Expression)

    if(termVar === this[$termVar]) return this

    const bodyExpr = this[$bodyExpr]
    const newBodyExpr = bodyExpr.bindTermVariable(termVar, expr)

    if(newBodyExpr === bodyExpr) return this

    return new LambdaExpression(termVar, termType, newBodyExpr)
  }

  bindType(typeVar, typeExpr) {
    assertType(typeVar, TypeVariable)
    assertType(type, TypeExpression)

    if(!this.freeTypeVariables().has(typeVar))
      return this

    const { argVar, argType, bodyExpr } = this
    const newArgType = argType.bindType(typeVar, typeExpr.getType())
    const newBodyExpr = bodyExpr.bindType(typeVar, typeExpr)

    return new LambdaExpression(argVar, newArgType, newBodyExpr)
  }

  applyExpr(expr) {
    assertType(expr, Expression)

    const { argVar, argType, bodyExpr } = this
    typeCheck(argType, expr.getType())

    return bodyExpr.bindTermVariable(argVar, expr)
  }
}
