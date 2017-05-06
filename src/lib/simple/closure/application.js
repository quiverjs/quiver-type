import { nodeFromValue, cons } from '../container'
import { Closure, assertClosure } from './closure'

const $lambdaClosure = Symbol('@lambdaClosure')
const $argClosure = Symbol('@argClosure')

export class ApplicationClosure extends Closure {
  constructor(lambdaClosure, argClosure) {
    assertClosure(lambdaClosure)
    assertClosure(argClosure)

    super()

    this[$lambdaClosure] = lambdaClosure
    this[$argClosure] = argClosure
  }

  get lambdaClosure() {
    return this[$lambdaClosure]
  }

  get argClosure() {
    return this[$argClosure]
  }

  bindValues(closureValues) {
    const { lambdaClosure, argClosure } = this
    const arg = argClosure.bindValues(closureValues)
    const args = nodeFromValue(arg)
    return lambdaClosure.bindApplyArgs(closureValues, args)
  }

  bindApplyArgs(closureValues, args) {
    const { lambdaClosure, argClosure } = this
    const arg = argClosure.bindValues(closureValues)
    const inArgs = cons(arg, args)
    return lambdaClosure.bindApplyArgs(closureValues, inArgs)
  }
}
