
/*
data Type
  = TypeVariable String
  | TypeLiteral String
  | FuncType Type Type
  | ApplicationType Type Type
  | ForAllType TypeVariable Type
*/

class Type {
  get isType() {
    return true
  }

  applyType(type) {
    throw new Error('Not implemented')
  }

  freeTypeVariable() {
    throw new Error('Not implemented')
  }
}

class TypeVariable extends Type {
  constructor(name) {
    if(typeof(name) !== 'string')
      throw new TypeError('Type variable name must be string')

    this.name = name
  }

}

class TypeLiteral extends Type {

}

class ApplicativeType extends Type {
  constructor(type1, type2) {
    assertType(type1, 'type1 must be a type')
    assertType(type2, 'type2 must be a type')

    this.type1 = type1
    this.type2 = type2
  }
}

class ForAllType extends Type {
  constructor(tvar, type) {

  }
}

class Scheme {
  constructor(tvars, type)

  get isScheme() {
    return true
  }
}
