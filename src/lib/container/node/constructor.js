import { cons } from './cons'
import { nil } from './nil'

export const valueNode = value =>
  cons(value, nil)
