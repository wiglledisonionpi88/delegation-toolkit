import { type Address, isAddress, encodePacked } from 'viem';

import type { DeleGatorEnvironment, Caveat } from '../types';
import { BalanceChangeType } from './types';

export const erc721BalanceChange = 'erc721BalanceChange';

/**
 * Builds a caveat struct for the ERC721BalanceChangeEnforcer.
 *
 * @param environment - The DeleGator environment.
 * @param tokenAddress - The tokenAddress of the ERC721 token.
 * @param recipient - The address of the recipient whose balance must change.
 * @param amount - The amount by which the recipient's balance must change.
 * @param changeType - The type of balance change (increase or decrease).
 * @returns The Caveat.
 * @throws Error if the token address is invalid, the recipient address is invalid, or the amount is not a positive number.
 */
export const erc721BalanceChangeBuilder = (
  environment: DeleGatorEnvironment,
  tokenAddress: Address,
  recipient: Address,
  amount: bigint,
  changeType: BalanceChangeType,
): Caveat => {
  if (!isAddress(tokenAddress, { strict: false })) {
    throw new Error('Invalid tokenAddress: must be a valid address');
  }

  if (!isAddress(recipient, { strict: false })) {
    throw new Error('Invalid recipient: must be a valid address');
  }

  if (amount <= 0) {
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
    [changeType, tokenAddress, recipient, amount],
  );

  const {
    caveatEnforcers: { ERC721BalanceChangeEnforcer },
  } = environment;

  if (!ERC721BalanceChangeEnforcer) {
    throw new Error('ERC721BalanceChangeEnforcer not found in environment');
  }

  return {
    enforcer: ERC721BalanceChangeEnforcer,
    terms,
    args: '0x',
  };
};
