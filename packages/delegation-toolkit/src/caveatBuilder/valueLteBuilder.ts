import { concat, toHex } from 'viem';

import type { Caveat, DeleGatorEnvironment } from '../types';

export const valueLte = 'valueLte';

/**
 * Builds a caveat struct for ValueLteEnforcer.
 *
 * @param environment - The DeleGator environment.
 * @param maxValue - The maximum value allowed for the transaction.
 * @returns The Caveat.
 * @throws Error if the maxValue is not a positive number.
 */
export const valueLteBuilder = (
  environment: DeleGatorEnvironment,
  maxValue: bigint,
): Caveat => {
  if (maxValue < 0n) {
    throw new Error('Invalid maxValue: must be greater than zero');
  }

  const terms = concat([toHex(maxValue, { size: 32 })]);

  const {
    caveatEnforcers: { ValueLteEnforcer },
  } = environment;

  if (!ValueLteEnforcer) {
    throw new Error('ValueLteEnforcer not found in environment');
  }

  return {
    enforcer: ValueLteEnforcer,
    terms,
    args: '0x',
  };
};
