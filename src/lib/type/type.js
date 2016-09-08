import { TypeVariable } from './variable'

/*
data Type
  = TypeVariable String
  | TypeLiteral String
  | FuncType Type Type
  | ApplicationType Type Type
  | ForAllType TypeVariable Type
*/

class Type {
  constructor() {
    if(this.constructor === Type)
      throw new Error('abstract class Type cannot be instantiated')
  }

  // freeTypeVariable :: () -> Set TypeVariable
  freeTypeVariables() {
    throw new Error('Not implemented')
  }

  // typeCheck :: Type -> Exception
  typeCheck(targetType) {

  }

  // bindType :: TypeVariable -> Type -> Type
  bindType(typeVar, type) {

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
