import { isAddress, concat, toHex } from 'viem';

import type { ExecutionStruct } from '../executions';
import type { Caveat, DeleGatorEnvironment } from '../types';

export const exactExecution = 'exactExecution';

/**
 * Builds a caveat struct for ExactExecutionEnforcer.
 * This enforcer ensures that the provided execution matches exactly
 * with the expected execution (target, value, and calldata).
 *
 * @param environment - The DeleGator environment.
 * @param execution - The expected execution to match against.
 * @returns The Caveat.
 * @throws Error if any of the execution parameters are invalid.
 */
export const exactExecutionBuilder = (
  environment: DeleGatorEnvironment,
  execution: ExecutionStruct,
): Caveat => {
  if (!isAddress(execution.target, { strict: false })) {
    throw new Error('Invalid target: must be a valid address');
  }

  if (execution.value < 0n) {
    throw new Error('Invalid value: must be a non-negative number');
  }

  if (!execution.callData.startsWith('0x')) {
    throw new Error('Invalid callData: must be a hex string starting with 0x');
  }

  const terms = concat([
    execution.target,
    toHex(execution.value, { size: 32 }),
    execution.callData,
  ]);

  const {
    caveatEnforcers: { ExactExecutionEnforcer },
  } = environment;

  if (!ExactExecutionEnforcer) {
    throw new Error('ExactExecutionEnforcer not found in environment');
  }

  return {
    enforcer: ExactExecutionEnforcer,
    terms,
    args: '0x',
  };
};
