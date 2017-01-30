import immutable from 'immutable'

export const ISet = immutable.Set
export const IList = immutable.List
export const IMap = immutable.Map

export const unionMap = function(mapper) {
  let result = ISet()

  for(const value of this) {
    result = result.union(mapper(value))
  }

  return result
}
