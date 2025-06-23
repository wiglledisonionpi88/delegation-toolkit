import { encodePacked } from 'viem';

import type { DeleGatorEnvironment, Caveat } from '../types';
import { TIMESTAMP_UPPER_BOUND_SECONDS } from './shared';

export const nativeTokenStreaming = 'nativeTokenStreaming';

/**
 * Builds a caveat struct for the NativeTokenStreamingEnforcer.
 *
 * @param environment - The DeleGator environment.
 * @param initialAmount - The initial amount of tokens to release at start time.
 * @param maxAmount - The maximum amount of tokens that can be released.
 * @param amountPerSecond - The rate at which the allowance increases per second.
 * @param startTime - The timestamp from which the allowance streaming begins.
 * @returns The Caveat.
 * @throws Error if the initial amount is not greater than zero.
 * @throws Error if the max amount is not a positive number.
 * @throws Error if the max amount is not greater than initial amount.
 * @throws Error if the amount per second is not a positive number.
 * @throws Error if the start time is not a positive number or exceeds the upper bound.
 */
export const nativeTokenStreamingBuilder = (
  environment: DeleGatorEnvironment,
  initialAmount: bigint,
  maxAmount: bigint,
  amountPerSecond: bigint,
  startTime: number,
): Caveat => {
  if (initialAmount < 0n) {
    throw new Error('Invalid initialAmount: must be greater than zero');
  }

  if (maxAmount <= 0n) {
    throw new Error('Invalid maxAmount: must be a positive number');
  }

  if (maxAmount < initialAmount) {
    throw new Error('Invalid maxAmount: must be greater than initialAmount');
  }

  if (amountPerSecond <= 0n) {
    throw new Error('Invalid amountPerSecond: must be a positive number');
  }

  if (startTime <= 0) {
    throw new Error('Invalid startTime: must be a positive number');
  }

  if (startTime > TIMESTAMP_UPPER_BOUND_SECONDS) {
    throw new Error(
      'Invalid startTime: must be less than or equal to 253402300799',
    );
  }

  const terms = encodePacked(
    ['uint256', 'uint256', 'uint256', 'uint256'],
    [initialAmount, maxAmount, amountPerSecond, BigInt(startTime)],
  );

  const {
    caveatEnforcers: { NativeTokenStreamingEnforcer },
  } = environment;

  if (!NativeTokenStreamingEnforcer) {
    throw new Error('NativeTokenStreamingEnforcer not found in environment');
  }

  return {
    enforcer: NativeTokenStreamingEnforcer,
    terms,
    args: '0x',
  };
};
