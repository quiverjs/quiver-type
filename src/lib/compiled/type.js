const $srcType = Symbol('@srcType')

export class CompiledType {
  constructor(srcType) {
    if(this.constructor === CompiledType)
      throw new Error('Abstract class CompiledType cannot be instantiated')

    this[$srcType] = srcType
  }

  get srcType() {
    return this[$srcType]
  }

  // typeCheck :: Object -> Bool
  typeCheck(object) {
    throw new Error('not implemented')
  }
}
