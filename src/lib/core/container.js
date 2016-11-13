import immutable from 'immutable'

export const ISet = immutable.Set
export const IList = immutable.List
export const IMap = immutable.Map

export const unionMap = function(mapper) {
  return this.reduce(
    (result, value) => {
      const set = mapper(value)
      return result.union(set)
    }, ISet())
}
