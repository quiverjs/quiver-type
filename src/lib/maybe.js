import { Functor } from './functor'

const a = abstractType('a')
const b = abstractType('b')

const Maybe = typeConstructor([a], {
  Nothing: [],
  Just: [a]
})

const fmap = genericFunction(
  [
    functionType([a, b]),
    Maybe.abstractType(a),
    Maybe.abstractType(b)
  ],
  (Mapper, MaybeA, MaybeB) => {
    const NothingB = MaybeB.constructors.Nothing
    const JustB = MaybeB.constructors.Just

    return (mapper, maybeA) =>
      MaybeA.typeSwitch(maybeA, {
        Nothing: NothingB,

        Just: a =>
          JustB(Mapper.invoke(mapper, a))
      })
  })

classInstance(Functor, Maybe, {
  fmap
})

const id = genericFunction(
  [a],
  A => {
    const MaybeA = Maybe.concreteType(A)

    return a =>
      MaybeA.Just(a)
  }
)

const apply = genericFunction(
  [
    Maybe.genericType(
      functionType([a, b])),
    Maybe.abstractType(a),
    Maybe.abstractType(b)
  ],
  (MaybeMapper, MaybeA, MaybeB) => {
    const [MapperAB] = MaybeMapper.typeArg
    const NothingB = MaybeB.constructors.Nothing
    const fmapAB = fmap.concreteType([MapperAB, MaybeA, MaybeB])

    return (maybeMapper, maybeA) => {
      MaybeMapper.typeSwitch(maybeMapper, {
        Nothing: NothingB,

        Just: mapper =>
          fmapAB.invoke(mapper, maybeA)
      })
    }
  }
)

classInstance(Applicative, Maybe, {
  id,
  apply
})
