import { IList } from '../../core/container'
import { CompiledFunction } from '../../compiled-term/function'
import {
  isInstanceOf, assertInstanceOf,
  assertListContent, assertNoError
} from '../../core/assert'

import { Term } from '../term'
import { LetTerm } from '../let'
import { ValueTerm } from '../value'
import { ArgSpec } from '../arg-spec'
import { VariableTerm } from '../variable'

import { LambdaTerm } from './common'

const closureWrap = (bodyClosure, compiledArrow) =>
  closureArgs => {
    const func = (...inArgs) => {
      return bodyClosure([...closureArgs, ...inArgs])
    }

    return new CompiledFunction(compiledArrow, func)
  }

export class ValueLambdaTerm extends LambdaTerm {
  compileClosure(closureArgs) {
    assertListContent(closureArgs, ArgSpec)

    const bodyClosure = this.compileLambda(closureArgs, IList())
    const compiledArrow = this.termType().compileType()

    return closureWrap(bodyClosure, compiledArrow)
  }

  compileLambda(closureSpecs, argSpecs) {
    assertListContent(closureSpecs, ArgSpec)
    assertListContent(argSpecs, ArgSpec)

    const { argVar, argType, bodyTerm } = this

    const compiledType = argType.compileType()

    const inArgSpecs = argSpecs.push(new ArgSpec(argVar, compiledType))

    if(bodyTerm instanceof ValueLambdaTerm) {
      return bodyTerm.compileLambda(closureSpecs, inArgSpecs)

    } else {
      return bodyTerm.compileClosure(closureSpecs.concat(inArgSpecs))
    }
  }

  applyTerm(argTerm) {
    assertInstanceOf(argTerm, Term)

    const { argVar, argType, bodyTerm } = this
    assertNoError(argType.typeCheck(argTerm.termType()))

    if(isInstanceOf(argTerm, ValueTerm) || isInstanceOf(argTerm, VariableTerm)) {
      return bodyTerm.bindTerm(argVar, argTerm).evaluate()

    } else {
      return new LetTerm(argVar, argTerm, bodyTerm)
    }
  }

  formatTerm() {
    const { argVar, argType, bodyTerm } = this

    const varRep = argVar.name
    const argTypeRep = argType.formatType()
    const bodyRep = bodyTerm.formatTerm()

    return ['value-lambda', [varRep, argTypeRep], bodyRep]
  }
}
