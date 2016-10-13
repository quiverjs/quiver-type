import { ImmutableMap } from 'quiver-util/immutable'

import { Type } from '../type/type'
import { Kind } from '../kind/kind'

import { assertType } from './assert'
import { TermVariable, TypeVariable } from './variable'

const $rawEnv = Symbol('@rawEnv')

const EnvClass = (Key, Value) =>
  class Env {
    constructor(rawEnv=ImmutableMap()) {
      this[$rawEnv] = rawEnv
    }

    get rawEnv() {
      return this[$rawEnv]
    }

    get(key) {
      assertType(key, Key)
      return this.rawEnv.get(key)
    }

    has(key) {
      assertType(key, Key)
      return this.rawEnv.has(key)
    }

    set(key, value) {
      assertType(key, Key)
      assertType(value, Value)

      const newEnv = this.rawEnv.set(key, value)
      return new Env(newEnv)
    }
  }

export const TypeEnv = EnvClass(TermVariable, Type)

export const KindEnv = EnvClass(TypeVariable, Kind)

export const emptyEnv = new TypeEnv()
