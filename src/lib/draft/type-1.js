
/*
  interface Type {
    apply :: Type -> Type

    flatten :: Env -> Type

    canApply :: Boolean
  }
*/

const assertType = type => {
  if(!type.isQuiverType) {
    throw new TypeError('argument must be quiver type')
  }
}

const abstractType = name => {
  const apply = innerType => {
    assertType(type)

    const apply = () => {
      throw new Error('abstract type is fully applied')
    }

    const flatten = () => {
      return innerType
    }

    return {
      isQuiverType: true,
      isFullyApplied: true,
      apply,
      flatten
    }
  }

  const type = {
    isQuiverType: true,
    isFullyApplied: false,
    apply
  }

  type.flatten = () => {
    return self
  }

  return type
}

const functionType = name => {
  const apply = inType => {
    assertType(inType)

    const apply = outType => {
      assertType(outType)

    }

    const flatten = () => {
      const flattenedIn = inType.flatten()
    }
  }


  return {
    isQuiverType: true,
    applyType,
  }
}
