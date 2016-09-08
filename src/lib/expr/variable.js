import { Set } from './container'
import { TermVariable } from './variable'
import { TermExpression } from './expr'

const $termVar = Symbol('@termVar')

const VariableExpression = ExpressionClass(
class extends TermExpression {
  constructor(termVar) {
    assertType(termVar, TermVariable)

    this[$termVar] = termVar
  }

  get termVar() {
    return this[$termVar]
  }

  freeTermVariables() {
    return Set([this.termVar])
  }

  bindTerm(termVar, expr) {
    assertType(termVar, TermVariable)
    assertType(expr, Expression)

    if(this.termVar === termVar) {
      return expr
    } else {
      return this
    }
  }

  bindTypeVariable(typeVar, typeExpr) {
    // no op
  }

  getType(env) {
    assertType(env, TypeEnv)

    const type = env.get(this.termVar)

    if(!type)
      throw new Error('type of term variable is not bound in typeEnv')

    return type
  }


  isTerminal() {
    return false
  }
})
