
export class Kind {
  constructor() {
    if(this.constructor === Kind)
      throw new TypeError('abstract class Kind cannot be instantiated')
  }

  kindCheck(kind) {
    throw new Error('not implemented')
  }
}
