import { Set } from './set'
import { nil } from '../node'
import { iterToSet } from '../algo'

export const emptySet = new Set(nil)

export const setFromIter = it => {
  const node = iterToSet(it)
  return new Set(node)
}
