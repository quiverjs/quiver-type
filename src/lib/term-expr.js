
class TermVariable { }

/*
data TermExpression
  = VariableTermExpression TermVariable
  | TermLambda TermVariable TermExpression
  | TermApplication TermLambda TermExpression
*/
class TermExpression extends Expression {

}

class VariableTermExpression extends TermExpression {
  constructor(termVar) {
    assertType(termVar, TermVariable,
      'termVar must be TermVariable')

    this[$termVar] = termVar
  }

  freeTermVariable() {
    return this[$termVar]
  }

  applyTermExpression(expr) {
    throw new TypeError('VariableTermExpression cannot be applied expression')
  }

  // substituteTerm :: TermVariable -> TermExpression -> TermExpression
  substituteTerm(termVar, termExpr) {
    assertType(termVar, TermVariable,
      'termVar must be TermVariable')

    assertType(termExpr, TermExpression,
      'termExpr must be TermExpression')

    if(this[$termVar] === termVar) {
      return termExpr
    } else {
      return this
    }
  }
}

class TermLambda extends TermExpression {
  // constructor :: TermVariable -> Expression -> ()
  constructor(termVar, expr) {
    assertType(termVar, TermVariable,
      'termVar must be TermVariable')

    assertType(expr, Expression,
      'expr must be Expression')

    this[$termVar] = termVar
    this[$typeVar] = new TypeVariable()
    this[$expr] = expr
  }

  // freeTermVariable :: () -> Set TermVariable
  freeTermVariable() {
    return this[$termExpr]
      .freeTermVariable()
      .delete(this[$termVar])
  }

  // freeTypeVariable :: () -> Set TypeVariable
  freeTypeVariable() {
    return this[$expr]
      .freeTypeVariable()
      .add(this[$typeVar])
  }

}

class ConstantExpression extends TermExpression {
  constructor(typeExpr, value) {
    assertType(typeExpr, TypeExpression,
      'typeExpr must be TypeExpression')

    if(!typeExpr.isTerminalType())
      throw new Error('type expression must be a terminal type')

    this[$typeExpr] = typeExpr
    this[$value] = value
  }

  freeTermVariable() {
    return ImmutableSet()
  }

  isTerminalTerm() {
    return true
  }

  termValue() {
    return value
  }
}

class FunctionExpression extends TermExpression {
  // constructor :: List TypeExpression -> TypeExpression -> Function -> ()
  constructor(inputTypes, returnType, func) {
    if(!ImmutableList.isList(inputTypes))
      throw new TypeError('inputTypes must be ImmutableList')

    for(const type of inputTypes) {
      assertType(type, TypeExpression,
        'inputTypes element must be TypeExpression')
    }

    assertType(returnType, TypeExpression,
      'returnType must be TypeExpression')

    assertFunction(func, 'func must be a function')

    if(!inputTypes.includes(returnType))
      throw new Error('return type must be derived from input type')

    this[$inputTypes] = inputTypes
    this[$returnType] = returnType
    this[$func] = func

    this[$inputTerms] = inputTypes.map(() => new TermVariable())
  }

  // substituteTerm :: TermVariable -> TermExpression -> TermExpression
  substituteTerm(termVar, termExpr) {
    assertType(termVar, TermVariable,
      'termVar must be TermVariable')

    assertType(termExpr, TermExpression,
      'termExpr must be TermExpression')

    const newInputTerms = this[$inputTerms].map(
      term => term.substituteTerm(termVar, termExpr))
  }
}
