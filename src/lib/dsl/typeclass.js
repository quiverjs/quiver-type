import {
  constraint, recordType
} from '../type/dsl'

import {
  abstract, proof, deconstraint,
  projectRecord, record
} from '../term/dsl'

export const typeclass = (className, methods) => {
  return constraint(className, recordType(methods))
}

export const classInstance = (typeclass, methods) => {
  return proof(typeclass, record(methods))
}

export const classMethod = (typeclass, method) => {
  return projectRecord(deconstraint(abstract(typeclass)), method)
}
