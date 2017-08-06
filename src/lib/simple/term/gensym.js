
export const gensym = (prefix='_') =>
  Symbol(prefix + Math.random().toString(16).substr(2, 4))
