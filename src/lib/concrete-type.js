
const IntType = new TypeLiteral({
  get name() {
    return 'Int'
  },

  typeCheck(num) {
    return (typeof(num) === 'number') && (num === (num|0))
  },

  constructType(num) {
    return num
  }
})
