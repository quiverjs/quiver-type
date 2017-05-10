import { Set } from './set'
import { iterToSet } from '../algo'

export const setFromIter = it => {
  const node = iterToSet(it)
  return new Set(node)
}
