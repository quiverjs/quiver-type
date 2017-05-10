import { Record } from './record'
import { isInstanceOf, assertInstanceOf } from '../assert'

export const isRecord = record =>
  isInstanceOf(record, Record)

export const assertRecord = record =>
  assertInstanceOf(record, Record)
