import test from 'tape'

import {
  constraint, deconstraint,
  abstract, proof,
  constraintLambda,
  value, apply,
  compile
} from '../lib/dsl'

import { NumberType, StringType } from '../lib/prelude'

import { termTypeEquals } from './util'

test('constraint test', assert => {
  assert.test('basic constraint', assert => {
    const FooConstraint = constraint('Foo', StringType)

    const FooProof = proof(FooConstraint, value('foo', StringType))

    assert.throws(() => proof(FooConstraint, value(1, NumberType)))

    const abstractFoo = abstract(FooConstraint)
    const fooLambda = constraintLambda([FooConstraint], deconstraint(abstractFoo))

    const fooTerm = apply(fooLambda, FooProof)

    assert::termTypeEquals(fooTerm, StringType)
    assert.equals(compile(fooTerm), 'foo')

    assert.end()
  })
})
