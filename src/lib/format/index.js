import { inspect } from 'util'

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
