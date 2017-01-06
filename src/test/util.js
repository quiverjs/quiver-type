export const equals = function(result, expected, message) {
  return this.ok(result.equals(expected), message)
}

export const termTypeEquals = function(term, expectedType, message) {
  const err = expectedType.typeCheck(term.termType())
  this.notOk(err, message)
}

export const typeKindEquals = function(type, expectedKind, message) {
  const err = expectedKind.kindCheck(type.typeKind())
  this.notOk(err, message)
}
