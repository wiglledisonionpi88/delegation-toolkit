import { type Hex, concat, toHex } from 'viem';

import type { Caveat, DeleGatorEnvironment } from '../types';
import { TIMESTAMP_UPPER_BOUND_SECONDS } from './shared';

export const timestamp = 'timestamp';

/**
 * Builds a caveat struct for the TimestampEnforcer.
 *
 * @param environment - The DeleGator environment.
 * @param timestampAfterThreshold - The timestamp (in seconds) after which the delegation can be used.
 * @param timestampBeforeThreshold - The timestamp (in seconds) before which the delegation can be used.
 * @returns The Caveat.
 * @throws Error if the timestamps are invalid.
 */
export const timestampBuilder = (
  environment: DeleGatorEnvironment,
  timestampAfterThreshold: number,
  timestampBeforeThreshold: number,
): Caveat => {
  if (timestampAfterThreshold < 0) {
    throw new Error(
      'Invalid timestampAfterThreshold: must be zero or positive',
    );
  }

  if (timestampBeforeThreshold < 0) {
    throw new Error(
      'Invalid timestampBeforeThreshold: must be zero or positive',
    );
  }

  if (timestampBeforeThreshold > TIMESTAMP_UPPER_BOUND_SECONDS) {
    throw new Error(
      'Invalid timestampBeforeThreshold: must be less than or equal to 253402300799',
    );
  }

  if (timestampAfterThreshold > TIMESTAMP_UPPER_BOUND_SECONDS) {
    throw new Error(
      'Invalid timestampAfterThreshold: must be less than or equal to 253402300799',
    );
  }

  if (
    timestampBeforeThreshold !== 0 &&
    timestampAfterThreshold >= timestampBeforeThreshold
  ) {
    throw new Error(
      'Invalid thresholds: timestampBeforeThreshold must be greater than timestampAfterThreshold when both are specified',
    );
  }

  const afterThresholdHex = toHex(timestampAfterThreshold, { size: 16 });
  const beforeThresholdHex = toHex(timestampBeforeThreshold, { size: 16 });

  const terms: Hex = concat([afterThresholdHex, beforeThresholdHex]);

  const {
    caveatEnforcers: { TimestampEnforcer },
  } = environment;

  if (!TimestampEnforcer) {
    throw new Error('TimestampEnforcer not found in environment');
  }

  return {
    enforcer: TimestampEnforcer,
    terms,
    args: '0x',
  };
};
