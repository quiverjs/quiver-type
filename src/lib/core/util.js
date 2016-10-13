export const mapUnique = function(mapper) {
  let modified = false

  const mappedList = this.map(value => {
    const mappedValue = mapper(value)

    if(value !== mappedValue)
      modified = true

    return mappedValue
  })

  return [mappedList, modified]
}
