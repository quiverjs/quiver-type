import { Term } from '../term/term'
import { ValueTerm } from '../term/value'
import { compileTerm } from '../term/compile'
import { assertInstanceOf } from '../core/assert'

export const exportTerm = term => {
  assertInstanceOf(term, Term)

  const type = term.termType()
  const value = compileTerm(term)

  return new ValueTerm(value, type)
}
