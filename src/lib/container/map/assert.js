import { Map } from './map'
import { isInstanceOf, assertInstanceOf } from '../assert'

export const isMap = map =>
  isInstanceOf(map, Map)

export const assertMap = map =>
  assertInstanceOf(map, Map)
