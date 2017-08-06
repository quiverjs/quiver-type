import { Closure } from './closure'
import { cons } from '../../container'

const $boundClosure = Symbol('@boundClosure')
const $bodyClosure = Symbol('@bodyClosure')

export class LetClosure extends Closure {
  constructor(boundClosure, bodyClosure) {
    super()

    this[$boundClosure] = boundClosure
    this[$bodyClosure] = bodyClosure
  }

  get boundClosure() {
    return this[$boundClosure]
  }

  get bodyClosure() {
    return this[$bodyClosure]
  }

  bindValues(closureValues) {
    const { boundClosure, bodyClosure } = this
    const bindValue = boundClosure.bindValues(closureValues)
    const inClosureValues = cons(bindValue, closureValues)
    return bodyClosure.bindValues(inClosureValues)
  }

  bindApplyArgs(closureValues, args) {
    const { boundClosure, bodyClosure } = this
    const bindValue = boundClosure.bindValues(closureValues)
    const inClosureValues = cons(bindValue, closureValues)
    return bodyClosure.bindApplyArgs(inClosureValues, args)
  }
}
