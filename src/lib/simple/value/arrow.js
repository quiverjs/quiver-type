
export class ArrowValue {
  constructor() {
    if(this.constructor === ArrowValue)
      throw new Error('abstract class Value cannot be instantiated')
  }

  apply(...args) {
    throw new Error('not implemented')
  }

  applyPartial(...args) {
    throw new Error('not implemented')
  }

  applyRaw(...args) {
    throw new Error('not implemented')
  }
}
