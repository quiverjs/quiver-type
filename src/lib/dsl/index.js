export {
  body, rawBody, compiledBody,
  lambda, termLambda,
  product, record,
  projectProduct, projectRecord,
  updateProduct, updateRecord,
  fixed, fold, lets,
  match, apply,
  applyType, typeLambda,
  unfold, unit, unitTerm,
  value, varTerm, variant,
  compile
} from '../term/dsl'

export {
  productType, recordType,
  typeApp, arrow,
  typeConstructor,
  fixedType, forall,
  literalType, sumType,
  unitType, varType
} from '../type/dsl'

export {
  arrowKind, unitKind
} from '../kind/dsl'

export { varGen, termVar, typeVar } from './variable'

export { functionTerm, typedFunction } from './function'
