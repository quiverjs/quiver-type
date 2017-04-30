import { VariableTerm } from '../term/variable'
import { VariableType } from '../type/variable'

import { assertString } from '../core/assert'

export const termVar = name => Symbol(name)
export const typeVar = name => Symbol(name)

export const varGen = () => {
  const varMap = new Map()

  const genVar = name => {
    assertString(name)

    if(varMap.has(name)) {
      return varMap.get(name)
    } else {
      const variable = Symbol(name)
      varMap.set(name, variable)
      return variable
    }
  }

  const varTerm = (name, type) =>
    new VariableTerm(genVar(name), type)

  const varType = (name, kind) =>
    new VariableType(genVar(name), kind)

  return {
    termVar: genVar,
    typeVar: genVar,
    varTerm, varType
  }
}
