import { Term } from '../term/term'
import { assertInstanceOf } from '../core/assert'

import { compileTerm } from './compile'

export const exportTerm = term => {
  assertInstanceOf(term, Term)

  const type = term.termType()
  const value = compileTerm(term)

  return new ValueTerm(value, type)
}
