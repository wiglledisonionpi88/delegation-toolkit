import { type Hex, isHex, pad } from 'viem';

import type { DeleGatorEnvironment, Caveat } from '../types';

export const nonce = 'nonce';

// char length of 32 byte hex string
const MAX_NONCE_STRING_LENGTH = 66;

/**
 * Builds a caveat struct for the NonceEnforcer.
 *
 * @param environment - The DeleGator environment.
 * @param nonceValue - The nonce value as a hexadecimal string.
 * @returns The Caveat.
 * @throws Error if the nonce is invalid.
 */
export const nonceBuilder = (
  environment: DeleGatorEnvironment,
  nonceValue: Hex,
): Caveat => {
  if (!nonceValue || nonceValue === '0x') {
    throw new Error('Invalid nonce: must be a non-empty hex string');
  }

  if (!isHex(nonceValue)) {
    throw new Error('Invalid nonce: must be a valid hex string');
  }

  if (nonceValue.length > MAX_NONCE_STRING_LENGTH) {
    throw new Error('Invalid nonce: must be 32 bytes or less in length');
  }

  const {
    caveatEnforcers: { NonceEnforcer },
  } = environment;

  if (!NonceEnforcer) {
    throw new Error('NonceEnforcer not found in environment');
  }

  return {
    enforcer: NonceEnforcer,
    terms: pad(nonceValue, { size: 32 }),
    args: '0x',
  };
};
