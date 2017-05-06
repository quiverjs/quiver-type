export class Closure {
  constructor() {
    if(this.constructor === Closure)
      throw new Error('Abstract class Closure cannot be instantiated')
  }

  // bindValues :: Node -> Any
  bindValues(closureValues) {
    throw new Error('not implemented')
  }

  // bindAndApply :: Node -> Node -> Any
  bindApplyArgs(closureValues, args) {
    throw new Error('not implemented')
  }
}
