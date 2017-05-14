import { Node } from './node'
import { isEntry } from './entry'
import {
  isString, isKeyword,
  isInstanceOf, assertInstanceOf
} from '../assert'

export const isNode = node =>
  isInstanceOf(node, Node)

export const assertNode = node =>
  assertInstanceOf(node, Node)

export const isKeyNode = node =>
  node.checkPred(isString)

export const isKeywordNode = node =>
  node.checkPred(isKeyword)

export const isEntryNode = node =>
  node.checkPred(isEntry)

export const assertKeyNode = node => {
  assertNode(node)
  if(!isKeyNode(node))
    throw new TypeError('type of node must be key node')
}

export const assertKeywordNode = node => {
  assertNode(node)
  if(!isKeywordNode(node))
    throw new TypeError('type of node must be key node')
}

export const assertEntryNode = node => {
  assertNode(node)
  if(!isEntryNode(node))
    throw new TypeError('type of node must be entry node')
}
