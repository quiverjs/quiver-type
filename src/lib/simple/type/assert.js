import { isType } from './type'
import { assertNode } from '../../container'

export const assertTypeNode = node => {
  assertNode(node)

  if(!node.checkPred(isType))
    throw new TypeError('type of node elements must be Type')
}
