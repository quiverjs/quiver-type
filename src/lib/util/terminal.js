import { Type } from '../type/type'
import { assertType } from '../core/assert'
import { Term } from '../term/term'

export const isTerminalType = type => {
  assertType(type, Type)

  return type.freeTypeVariables().isEmpty()
}

export const isTerminalTerm = term => {
  assertType(term, Term)

  return term.freeTermVariables().isEmpty() &&
    isTerminalType(term.termType())
}
