import { Term } from './term'
import {
  assertVariable,
  assertInstanceOf,
  assertListContent,
} from '../common/assert'

export const assertTerm = term =>
  assertInstanceOf(term, Term)

export const assertArgVars = argVars =>
  assertListContent(argVars, assertVariable)
