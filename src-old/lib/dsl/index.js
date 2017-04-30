export {
  body, rawBody, compiledBody,
  lambda, termLambda,
  product, record,
  projectProduct, projectRecord,
  updateProduct, updateRecord,
  fixed, fold, lets,
  match, when, apply,
  applyType, typeLambda,
  unfold, unit, unitTerm,
  value, varTerm, variant,
  abstract, constraintLambda,
  proof, deconstraint,
  compile
} from '../term/dsl'

export {
  productType, recordType,
  typeApp, arrow,
  typeConstructor,
  fixedType, unfoldType,
  forall,
  literalType, sumType,
  unitType, varType,
  constraint
} from '../type/dsl'

export {
  arrowKind, unitKind
} from '../kind/dsl'

export { varGen, termVar, typeVar } from './variable'

export { functionTerm, typedFunction } from './function'

export {
  typeclass, classInstance, classMethod
} from './typeclass'
