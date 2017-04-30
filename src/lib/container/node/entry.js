import {
  isInstanceOf,
  assertKeyword,
  assertInstanceOf
} from '../common/assert'

const $key = Symbol('@key')
const $value = Symbol('@value')

export class Entry {
  constructor(key, value) {
    assertKeyword(key)

    this[$key] = key
    this[$value] = value
  }

  get key() {
    return this[$key]
  }

  get value() {
    return this[$value]
  }

  *[Symbol.iterator]() {
    const { key, value } = this
    yield key
    yield value
  }
}

export const isEntry = entry =>
  isInstanceOf(entry, Entry)

export const assertEntry = entry =>
  assertInstanceOf(entry)
