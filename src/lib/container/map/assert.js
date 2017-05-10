import { Map } from './map'
import { assertInstanceOf } from '../assert'

export const assertMap = map =>
  assertInstanceOf(map, Map)
