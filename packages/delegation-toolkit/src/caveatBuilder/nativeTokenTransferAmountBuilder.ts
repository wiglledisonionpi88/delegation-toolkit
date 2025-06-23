import { encodePacked } from 'viem';

import type { Caveat, DeleGatorEnvironment } from '../types';

export const nativeTokenTransferAmount = 'nativeTokenTransferAmount';

/**
 * Builds a caveat struct for the NativeTokenTransferAmountEnforcer.
 *
 * @param environment - The DeleGator environment.
 * @param allowance - The maximum amount of native tokens allowed (in wei).
 * @returns The Caveat.
 * @throws Error if the allowance is negative.
 */
export const nativeTokenTransferAmountBuilder = (
  environment: DeleGatorEnvironment,
  allowance: bigint,
): Caveat => {
  if (allowance < 0n) {
    throw new Error('Invalid allowance: must be zero or positive');
  }

  const terms = encodePacked(['uint256'], [allowance]);

  const {
    caveatEnforcers: { NativeTokenTransferAmountEnforcer },
  } = environment;

  if (!NativeTokenTransferAmountEnforcer) {
    throw new Error(
      'NativeTokenTransferAmountEnforcer not found in environment',
    );
  }

  return {
    enforcer: NativeTokenTransferAmountEnforcer,
    terms,
    args: '0x',
  };
};
