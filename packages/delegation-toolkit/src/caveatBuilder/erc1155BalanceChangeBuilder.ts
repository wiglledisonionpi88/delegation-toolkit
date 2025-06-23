import { type Address, isAddress, encodePacked } from 'viem';

import type { DeleGatorEnvironment, Caveat } from '../types';
import { BalanceChangeType } from './types';

export const erc1155BalanceChange = 'erc1155BalanceChange';

/**
 * Builds a caveat struct for the ERC1155BalanceChangeEnforcer.
 *
 * @param environment - The DeleGator environment.
 * @param tokenAddress - The tokenAddress of the ERC1155 token.
 * @param recipient - The address of the recipient whose balance must change.
 * @param tokenId - The ID of the ERC1155 token.
 * @param balance - The amount by which the recipient's balance must change.
 * @param changeType - The type of balance change (increase or decrease).
 * @returns The Caveat.
 * @throws Error if the token address is invalid, the recipient address is invalid, or the amount is not a positive number.
 */
export const erc1155BalanceChangeBuilder = (
  environment: DeleGatorEnvironment,
  tokenAddress: Address,
  recipient: Address,
  tokenId: bigint,
  balance: bigint,
  changeType: BalanceChangeType,
): Caveat => {
  if (!isAddress(tokenAddress, { strict: false })) {
    throw new Error('Invalid tokenAddress: must be a valid address');
  }

  if (!isAddress(recipient, { strict: false })) {
    throw new Error('Invalid recipient: must be a valid address');
  }

  if (balance <= 0n) {
    throw new Error('Invalid balance: must be a positive number');
  }

  if (tokenId < 0) {
    throw new Error('Invalid tokenId: must be a non-negative number');
  }

  if (
    changeType !== BalanceChangeType.Increase &&
    changeType !== BalanceChangeType.Decrease
  ) {
    throw new Error('Invalid changeType: must be either Increase or Decrease');
  }

  const terms = encodePacked(
    ['uint8', 'address', 'address', 'uint256', 'uint256'],
    [changeType, tokenAddress, recipient, tokenId, balance],
  );

  const {
    caveatEnforcers: { ERC1155BalanceChangeEnforcer },
  } = environment;

  if (!ERC1155BalanceChangeEnforcer) {
    throw new Error('ERC1155BalanceChangeEnforcer not found in environment');
  }

  return {
    enforcer: ERC1155BalanceChangeEnforcer,
    terms,
    args: '0x',
  };
};
