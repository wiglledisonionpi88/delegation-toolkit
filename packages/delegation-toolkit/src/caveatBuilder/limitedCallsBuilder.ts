import { type Hex, toHex, pad } from 'viem';

import type { DeleGatorEnvironment, Caveat } from '../types';

export const limitedCalls = 'limitedCalls';

/**
 * Builds a caveat struct for the LimitedCallsEnforcer.
 *
 * @param environment - The DeleGator environment.
 * @param limit - The maximum number of calls allowed.
 * @returns The Caveat.
 * @throws Error if the limit is not a positive integer.
 */
export const limitedCallsBuilder = (
  environment: DeleGatorEnvironment,
  limit: number,
): Caveat => {
  if (!Number.isInteger(limit)) {
    throw new Error('Invalid limit: must be an integer');
  }

  if (limit <= 0) {
    throw new Error('Invalid limit: must be a positive integer');
  }

  const terms: Hex = pad(toHex(limit), { size: 32 });

  const {
    caveatEnforcers: { LimitedCallsEnforcer },
  } = environment;

  if (!LimitedCallsEnforcer) {
    throw new Error('LimitedCallsEnforcer not found in environment');
  }

  return {
    enforcer: LimitedCallsEnforcer,
    terms,
    args: '0x',
  };
};
