import { concat, isAddress, toHex } from 'viem';
import type { Address } from 'viem';

import type { Caveat, DeleGatorEnvironment } from '../types';

export const erc20PeriodTransfer = 'erc20PeriodTransfer';

/**
 * Builds a caveat struct for ERC20PeriodTransferEnforcer.
 * This enforcer validates that ERC20 token transfers do not exceed a specified amount
 * within a given time period. The transferable amount resets at the beginning of each period,
 * and any unused tokens are forfeited once the period ends.
 *
 * @param environment - The DeleGator environment.
 * @param tokenAddress - The address of the ERC20 token contract.
 * @param periodAmount - The maximum amount of tokens that can be transferred per period.
 * @param periodDuration - The duration of each period in seconds.
 * @param startDate - The timestamp when the first period begins.
 * @returns The Caveat.
 * @throws Error if the token address is invalid or if any of the numeric parameters are invalid.
 */
export const erc20PeriodTransferBuilder = (
  environment: DeleGatorEnvironment,
  tokenAddress: Address,
  periodAmount: bigint,
  periodDuration: number,
  startDate: number,
): Caveat => {
  if (!isAddress(tokenAddress)) {
    throw new Error('Invalid tokenAddress: must be a valid address');
  }

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
    tokenAddress,
    toHex(periodAmount, { size: 32 }),
    toHex(periodDuration, { size: 32 }),
    toHex(startDate, { size: 32 }),
  ]);

  const {
    caveatEnforcers: { ERC20PeriodTransferEnforcer },
  } = environment;

  if (!ERC20PeriodTransferEnforcer) {
    throw new Error('ERC20PeriodTransferEnforcer not found in environment');
  }

  return {
    enforcer: ERC20PeriodTransferEnforcer,
    terms,
    args: '0x',
  };
};
