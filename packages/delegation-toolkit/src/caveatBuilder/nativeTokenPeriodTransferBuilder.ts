import { concat, toHex } from 'viem';

import type { Caveat, DeleGatorEnvironment } from '../types';

export const nativeTokenPeriodTransfer = 'nativeTokenPeriodTransfer';

/**
 * Builds a caveat struct for NativeTokenPeriodTransferEnforcer.
 * This enforcer validates that native token (ETH) transfers do not exceed a specified amount
 * within a given time period. The transferable amount resets at the beginning of each period,
 * and any unused ETH is forfeited once the period ends.
 *
 * @param environment - The DeleGator environment.
 * @param periodAmount - The maximum amount of ETH (in wei) that can be transferred per period.
 * @param periodDuration - The duration of each period in seconds.
 * @param startDate - The timestamp when the first period begins.
 * @returns The Caveat.
 * @throws Error if any of the numeric parameters are invalid.
 */
export const nativeTokenPeriodTransferBuilder = (
  environment: DeleGatorEnvironment,
  periodAmount: bigint,
  periodDuration: number,
  startDate: number,
): Caveat => {
  if (periodAmount <= 0n) {
    throw new Error('Invalid periodAmount: must be a positive number');
  }

  if (periodDuration <= 0) {
    throw new Error('Invalid periodDuration: must be a positive number');
  }

  if (startDate <= 0) {
    throw new Error('Invalid startDate: must be a positive number');
  }

  const terms = concat([
    toHex(periodAmount, { size: 32 }),
    toHex(periodDuration, { size: 32 }),
    toHex(startDate, { size: 32 }),
  ]);

  const {
    caveatEnforcers: { NativeTokenPeriodTransferEnforcer },
  } = environment;

  if (!NativeTokenPeriodTransferEnforcer) {
    throw new Error(
      'NativeTokenPeriodTransferEnforcer not found in environment',
    );
  }

  return {
    enforcer: NativeTokenPeriodTransferEnforcer,
    terms,
    args: '0x',
  };
};
