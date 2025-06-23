import { type Address, isAddress, encodePacked } from 'viem';

import type { DeleGatorEnvironment, Caveat } from '../types';
import { BalanceChangeType } from './types';

export const erc20BalanceChange = 'erc20BalanceChange';

/**
 * Builds a caveat struct for the ERC20BalanceChangeEnforcer.
 *
 * @param environment - The DeleGator environment.
 * @param tokenAddress - The tokenAddress of the ERC20 token.
 * @param recipient - The address of the recipient whose balance must change.
 * @param balance - The minimum balance amount required.
 * @param changeType - Whether the balance should increase or decrease.
 * @returns The Caveat.
 * @throws Error if the token address is invalid, the amount is not a positive number, or the change type is invalid.
 */
export const erc20BalanceChangeBuilder = (
  environment: DeleGatorEnvironment,
  tokenAddress: Address,
  recipient: Address,
  balance: bigint,
  changeType: BalanceChangeType,
): Caveat => {
  if (!isAddress(tokenAddress, { strict: false })) {
    throw new Error('Invalid tokenAddress: must be a valid address');
  }

  if (balance <= 0n) {
    throw new Error('Invalid balance: must be a positive number');
  }

  if (
    changeType !== BalanceChangeType.Increase &&
    changeType !== BalanceChangeType.Decrease
  ) {
    throw new Error('Invalid changeType: must be either Increase or Decrease');
  }

  const terms = encodePacked(
    ['uint8', 'address', 'address', 'uint256'],
    [changeType, tokenAddress, recipient, balance],
  );

  const {
    caveatEnforcers: { ERC20BalanceChangeEnforcer },
  } = environment;

  if (!ERC20BalanceChangeEnforcer) {
    throw new Error('ERC20BalanceChangeEnforcer not found in environment');
  }

  return {
    enforcer: ERC20BalanceChangeEnforcer,
    terms,
    args: '0x',
  };
};
