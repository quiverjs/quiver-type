import { Record } from './record'
import { isInstanceOf, assertInstanceOf } from '../common/assert'

export const isRecord = record =>
  isInstanceOf(record, Record)

export const assertRecord = record =>
  assertInstanceOf(record, Record)
