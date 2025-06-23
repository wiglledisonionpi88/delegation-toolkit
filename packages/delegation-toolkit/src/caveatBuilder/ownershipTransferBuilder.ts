import { type Address, isAddress } from 'viem';

import type { DeleGatorEnvironment, Caveat } from '../types';

export const ownershipTransfer = 'ownershipTransfer';

/**
 * Builds a caveat struct for the OwnershipTransferEnforcer.
 *
 * @param environment - The DeleGator environment.
 * @param targetContract - The target contract address for the ownership transfer.
 * @returns The Caveat representing the caveat for ownership transfer.
 * @throws Error if the target contract address is invalid.
 */
export const ownershipTransferBuilder = (
  environment: DeleGatorEnvironment,
  targetContract: Address,
): Caveat => {
  if (!isAddress(targetContract, { strict: false })) {
    throw new Error('Invalid targetContract: must be a valid address');
  }

  const terms = targetContract;

  const {
    caveatEnforcers: { OwnershipTransferEnforcer },
  } = environment;

  if (!OwnershipTransferEnforcer) {
    throw new Error('OwnershipTransferEnforcer not found in environment');
  }

  return {
    enforcer: OwnershipTransferEnforcer,
    terms,
    args: '0x',
  };
};
