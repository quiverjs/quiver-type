
{
  const xVar = termVar('x')
  const aTvar = typeVar('a')
  const identityExpr = exprFromFunc([ [xVar, aTvar] ], aTvar, x => x)
  const identityLambda = lambda(xVar, tvar(), identityExpr)
  const identityTypeLambda = generalize(identityLambda)

  const identityIntLambda = applyTypeLambda(identityTypeLambda, IntType)
  const arg = constantExpr(1, IntType)
  const result1 = applyLambda(identityIntLambda, arg)

  const identityInt = compileLambda(identityIntLambda)
  const result2 = identityInt(1)
}

{

}
