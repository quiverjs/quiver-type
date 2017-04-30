import { isInstanceOf, assertInstanceOf } from '../common/assert'

import { Node } from './node'

export const isNode = node => {
  return isInstanceOf(node, Node)
}

export const isMaybeNode = node => {
  return isInstanceOf(node, Node) || node === null
}

export const assertMaybeNode = node => {
  if(!isMaybeNode(node))
    throw new TypeError('argument must be either null or instance of Node')
}

export const assertNode = node =>
  assertInstanceOf(node, Node)

export const assertKeyNode = node => {
  if(!node.isKeyNode())
    throw new TypeError('argument must be key node containing strings only')
}

export const assertEntryNode = node => {
  if(!node.isEntryNode())
    throw new TypeError('argument must be entry node containing key value entries')
}
