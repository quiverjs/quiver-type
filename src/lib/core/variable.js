import { assertString } from 'quiver-util/assert'

const $name = Symbol('@name')

const idgen = () =>
  Math.random().toString(16).substr(2, 4)

class Variable {
  constructor(name) {
    assertString(name)

    const id = idgen()
    this[$name] = `${name}_${id}`
  }

  get name() {
    return this[$name]
  }

  toString() {
    return this.name
  }
}

export class TermVariable extends Variable { }

export class TypeVariable extends Variable { }
