import { List } from '../core/container'
import { assertType } from '../core/assert'

import { Term } from '../term/term'

export const compileTerm = term => {
  assertType(term, Term)

  return term.evaluate().compileBody(List())()
}
