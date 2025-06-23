import { maxUint256, toHex } from 'viem';

import type { DeleGatorEnvironment, Caveat } from '../types';

export const id = 'id';

/**
 * Builds a caveat struct for the IdEnforcer.
 *
 * @param environment - The DeleGator environment.
 * @param idValue - The id to use in the caveat.
 * @returns The Caveat.
 * @throws Error if the provided id is not a number, not an integer, or is not 32 bytes or fewer in length.
 */
export function idBuilder(
  environment: DeleGatorEnvironment,
  idValue: number,
): Caveat {
  if (!Number.isInteger(idValue)) {
    throw new Error('Invalid id: must be an integer');
  }

  if (idValue < 0) {
    throw new Error('Invalid id: must be positive');
  }

  if (idValue > maxUint256) {
    throw new Error('Invalid id: must be less than 2^256');
  }

  const terms = toHex(idValue, { size: 32 });

  const {
    caveatEnforcers: { IdEnforcer },
  } = environment;

  if (!IdEnforcer) {
    throw new Error('IdEnforcer not found in environment');
  }

  return {
    enforcer: IdEnforcer,
    terms,
    args: '0x',
  };
}
