import { Set } from './set'
import { nil, cons } from '../node'
import { iterToSet } from '../algo'

export const emptySet = new Set(nil)

export const setFromIter = it => {
  const node = iterToSet(it)
  return new Set(node)
}

export const setWithValue = value => {
  return new Set(cons(value, nil))
}
