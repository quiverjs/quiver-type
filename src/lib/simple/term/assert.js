import { isKeyword, assertKeyword } from '../../assert'

export const isVariable = variable =>
  isKeyword(variable)

export const assertVariable = variable =>
  assertKeyword(variable)
