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
  value, varTerm, variant
} from './term/dsl'

export {
  productType, recordType,
  applicationType, arrow,
  typeConstructor,
  fixedType, forall,
  literalType, sumType,
  unitType, varType
} from './type/dsl'

export {
  arrowKind, unitKind
} from './kind/dsl'

export { termVar, typeVar } from './core/variable'
