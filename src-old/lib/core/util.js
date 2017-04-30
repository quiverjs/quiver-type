import { inspect } from 'util'

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

export const formatLisp = list => {
  const str = inspect(list, {
    depth: 20,
    breakLength: 80
  })

  const lispStr = str
    .replace(/[\,\'\"]/g, '')
    .replace(/\[\ /g, '(')
    .replace(/\ \]/g, ')')

  return lispStr
}
