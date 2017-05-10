import { Map } from './map'
import { entryIterToMap } from '../algo'

export const mapFromEntries = it => {
  const node = entryIterToMap(it)
  return new Map(node)
}
