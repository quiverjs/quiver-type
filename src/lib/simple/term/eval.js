import { assertTerm } from './term'
import { nil } from '../../container'

export const evalTerm = term => {
  assertTerm(term)

  const closure = term
    .normalForm()
    .compileClosure(nil)

  return closure.bindValues(nil)
}
