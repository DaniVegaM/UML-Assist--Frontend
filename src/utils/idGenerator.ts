/**
 * Centralized id generator for all node types.
 *
 * IMPORTANT:
 * - Use this only when CREATING new nodes.
 * - Never rewrite ids of existing nodes loaded from storage, otherwise edges break.
 */

export type NodeTypeIdKey =
  // Activities diagram
  | 'activity'
  | 'simpleAction'
  | 'dataNode'
  | 'objectNode'
  | 'acceptEvent'
  | 'acceptTimeEvent'
  | 'sendSignal'
  | 'callOperation'
  | 'callBehavior'
  | 'initialNode'
  | 'finalNode'
  | 'finalFlowNode'
  | 'decisionControl'
  | 'mergeNode'
  | 'parallelizationNode'
  | 'connectorNode'
  | 'exceptionHandling'
  | 'note'
  | 'InterruptActivityRegion'
  // Sequence diagram
  | 'lifeLine'
  | 'baseFragment'
  | 'addLifeLineBtn'
  | "altFragment"
  | "optFragment"
  | "loopFragment"
  | "breakFragment"
  | "seqFragment"
  | "strictFragment"
  | "parFragment";


const PREFIX_BY_TYPE: Record<NodeTypeIdKey, string> = {
  activity: 'actv',
  simpleAction: 'actn',
  acceptEvent: 'acce',
  acceptTimeEvent: 'acct',
  sendSignal: 'smsg',
  callOperation: 'cllo',
  callBehavior: 'cllb',
  connectorNode: 'cnnt',
  initialNode: 'intl',
  finalNode: 'finl',
  finalFlowNode: 'ffin',
  decisionControl: 'dcsn',
  mergeNode: 'mrge',
  parallelizationNode: 'prll',
  dataNode: 'data',
  objectNode: 'objc',
  exceptionHandling: 'exhn',
  note: 'note',
  InterruptActivityRegion: 'iar',

  // Sequence
  lifeLine: 'lobj',
  addLifeLineBtn: 'albn',

  //Fragmentos
  altFragment: 'altf',
  optFragment: 'optf',
  loopFragment: 'loop',
  breakFragment: 'brkf',
  seqFragment: 'seqf',
  strictFragment: 'strf',
  parFragment: 'parf',

  baseFragment: 'frag',
};

export function generateShortUniqueId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
}

export function createPrefixedNodeId(type: NodeTypeIdKey): string {
  const prefix = PREFIX_BY_TYPE[type] ?? 'node';
  return `${prefix}_${generateShortUniqueId()}`;
}
