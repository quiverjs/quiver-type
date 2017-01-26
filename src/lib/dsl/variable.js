import { VariableTerm } from '../term/variable'
import { VariableType } from '../type/variable'

import { assertString } from '../core/assert'

import { TermVariable, TypeVariable } from '../core/variable'

export const termVar = name => new TermVariable(name)

export const typeVar = name => new TypeVariable(name)

const makeVarGen = Variable =>
  () => {
    const varMap = new Map()

    const genVar = name => {
      assertString(name)

      if(varMap.has(name)) {
        return varMap.get(name)
      } else {
        const variable = new Variable(name)
        varMap.set(name, variable)
        return variable
      }
    }

    return genVar
  }

const termVarGen = makeVarGen(TermVariable)
const typeVarGen = makeVarGen(TypeVariable)

export const varGen = () => {
  const termVar = termVarGen()
  const typeVar = typeVarGen()

  const varTerm = (name, type) =>
    new VariableTerm(termVar(name), type)

  const varType = (name, kind) =>
    new VariableType(typeVar(name), kind)

  return {
    termVar, typeVar,
    varTerm, varType
  }
}
