import { Type } from '../type/type'
import { assertInstanceOf } from '../core/assert'
import { Term } from '../term/term'

export const isTerminalType = type => {
  assertInstanceOf(type, Type)

  return type.freeTypeVariables().isEmpty()
}

export const isTerminalTerm = term => {
  assertInstanceOf(term, Term)

  return term.freeTermVariables().isEmpty() &&
    isTerminalType(term.termType())
}
