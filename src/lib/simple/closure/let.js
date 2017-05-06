import { Closure } from './closure'
import { cons } from '../container'

const $bindClosure = Symbol('@bindClosure')
const $bodyClosure = Symbol('@bodyClosure')

export class LetClosure extends Closure {
  constructor(bindClosure, bodyClosure) {
    this[$bindClosure] = bindClosure
    this[$bodyClosure] = bodyClosure
  }

  get bindClosure() {
    return this[$bindClosure]
  }

  get bodyClosure() {
    return this[$bodyClosure]
  }

  bindValues(closureValues) {
    const { bindClosure, bodyClosure } = this
    const bindValue = bindClosure.bindValues(closureValues)
    const inClosureValues = cons(bindValue, closureValues)
    return bodyClosure.bindValues(inClosureValues)
  }

  bindApplyArgs(closureValues, args) {
    const { bindClosure, bodyClosure } = this
    const bindValue = bindClosure.bindValues(closureValues)
    const inClosureValues = cons(bindValue, closureValues)
    return bodyClosure.bindApplyArgs(inClosureValues, args)
  }
}
