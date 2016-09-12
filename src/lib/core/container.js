import immutable from 'immutable'

export const Set = immutable.Set
export const List = immutable.List
export const Map = immutable.Map

export const unionMap = function(mapper) {
  return this.reduce(
    (result, value) => {
      const set = mapper(value)
      return result.union(set)
    }, Set())
}
