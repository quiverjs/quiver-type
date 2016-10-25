export class Kind {
  constructor() {
    if(this.constructor === Kind)
      throw new TypeError('abstract class Kind cannot be instantiated')
  }

  // kindCheck :: Kind -> Maybe Error
  kindCheck(kind) {
    throw new Error('not implemented')
  }

  // formatKind :: () -> String
  formatKind() {
    throw new Error('not implemented')
  }
}
