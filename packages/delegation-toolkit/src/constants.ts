/**
 * To be used in sdk methods to call Implementation specific code
 * @type {Implementation}
 */
export enum Implementation {
  MultiSig = 'MultiSig',
  Hybrid = 'Hybrid',
  Stateless7702 = 'Stateless7702',
}

/**
 * To be used on a delegation as the root authority.
 */
export const ROOT_AUTHORITY =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

/**
 * To be used on a delegation as the any delegate.
 */
export const ANY_DELEGATE = '0x0000000000000000000000000000000000000a11';
