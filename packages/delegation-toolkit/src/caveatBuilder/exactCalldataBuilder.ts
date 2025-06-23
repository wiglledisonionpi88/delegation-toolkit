import type { Caveat, DeleGatorEnvironment } from '../types';

export const exactCalldata = 'exactCalldata';

/**
 * Builds a caveat struct for ExactCalldataEnforcer.
 * This enforcer ensures that the provided execution calldata matches exactly
 * the expected calldata.
 *
 * @param environment - The DeleGator environment.
 * @param callData - The expected calldata to match against.
 * @returns The Caveat.
 * @throws Error if the callData is invalid.
 */
export const exactCalldataBuilder = (
  environment: DeleGatorEnvironment,
  callData: `0x${string}`,
): Caveat => {
  if (!callData.startsWith('0x')) {
    throw new Error('Invalid callData: must be a hex string starting with 0x');
  }

  const {
    caveatEnforcers: { ExactCalldataEnforcer },
  } = environment;

  if (!ExactCalldataEnforcer) {
    throw new Error('ExactCalldataEnforcer not found in environment');
  }

  return {
    enforcer: ExactCalldataEnforcer,
    terms: callData,
    args: '0x',
  };
};
