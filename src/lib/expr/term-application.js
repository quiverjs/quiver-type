
export const TermApplication = ExpressionClass(
class extends Expression {
  constructor(leftExpr, rightExpr) {
    assertType(leftExpr, Expression)
    assertType(rightExpr, Expression)

    const leftType = leftExpr.getType()

    assertType(leftType, ArrowType,
      'type of leftExpr must be arrow type')

    const argType = leftType.leftType
    const rightType = rightExpr.getType()

    argType.typeCheck(rightType)

    this[$leftExpr] = leftExpr
    this[$rightExpr] = rightExpr
  }

  get leftExpr() {
    return this[$leftExpr]
  }

  get rightExpr() {
    return this[$rightExpr]
  }

  getType(env) {
    return this.leftExpr.getType(env).rightType
  }

  freeTermVariables() {
    const { leftExpr, rightExpr } = this
    return leftExpr.freeTermVariables()
      .union(rightExpr.freeTermVariables())
  }

  freeTypeVariables() {
    const { leftExpr, rightExpr } = this
    return leftExpr.freeTypeVariables()
      .union(rightExpr.freeTypeVariables())
  }

  bindTerm(termVar, expr) {
    assertType(termVar, TermVariable)
    assertType(expr, Expression)

    if(!this.freeTermVariables().has(termVar))
      return this

    const { leftExpr, rightExpr } = this

    const newLeftExpr = leftExpr.bindTerm(termVar, expr)
    const newRightExpr = rightExpr.bindTerm(termVar, expr)

    return new TermApplication(newLeftExpr, newRightExpr)
  }

  bindType(typeVar, type) {
    assertType(typeVar, TypeVariable)
    assertType(type, Type)

    if(!this.freeTypeVariables().has(typeVar))
      return this

    const { leftExpr, rightExpr } = this

    const newLeftExpr = leftExpr.bindType(typeVar, type)
    const newRightExpr = rightExpr.bindType(typeVar, type)

    return new TermApplication(newLeftExpr, newRightExpr)
  }

  reduce() {
    const { leftExpr, rightExpr } = this

    const newLeftExpr = leftExpr.reduce()
    const newRightExpr = rightExpr.reduce()

    if(leftExpr === newLeftExpr && rightExpr === newRightExpr) {
      return this
    }

    if(newLeftExpr instanceof LambdaExpression) {
      return newLeftExpr.applyTerm(newRightExpr).reduce()
    } else {
      return new TermApplication(newLeftExpr, newRightExpr)
    }
  }
})
