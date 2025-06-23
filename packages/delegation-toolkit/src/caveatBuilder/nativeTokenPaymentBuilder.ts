import { type Hex, encodePacked, isAddress } from 'viem';

import type { Caveat, DeleGatorEnvironment } from '../types';

export const nativeTokenPayment = 'nativeTokenPayment';

/**
 * Builds a caveat struct for the NativeTokenPaymentEnforcer.
 *
 * @param environment - The DeleGator environment.
 * @param recipient - The address of the recipient of the payment.
 * @param amount - The amount of native tokens required for the payment.
 * @returns The Caveat.
 * @throws Error if the amount is invalid or the recipient address is invalid.
 */
export const nativeTokenPaymentBuilder = (
  environment: DeleGatorEnvironment,
  recipient: Hex,
  amount: bigint,
): Caveat => {
  if (amount <= 0n) {
    throw new Error('Invalid amount: must be positive');
  }

  if (!isAddress(recipient)) {
    throw new Error('Invalid recipient: must be a valid address');
  }

  const terms = encodePacked(['address', 'uint256'], [recipient, amount]);

  const {
    caveatEnforcers: { NativeTokenPaymentEnforcer },
  } = environment;

  if (!NativeTokenPaymentEnforcer) {
    throw new Error('NativeTokenPaymentEnforcer not found in environment');
  }

  return {
    enforcer: NativeTokenPaymentEnforcer,
    terms,
    args: '0x',
  };
};
