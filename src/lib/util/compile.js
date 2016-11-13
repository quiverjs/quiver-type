import { List } from '../core/container'
import { assertInstanceOf } from '../core/assert'

import { Term } from '../term/term'

export const compileTerm = term => {
  assertInstanceOf(term, Term)

  return term.evaluate().compileBody(List())()
}
