import { beforeEach, test, expect } from 'vitest';
import {
  createCaveatBuilder,
  createExecution,
  createDelegation,
  Implementation,
  toMetaMaskSmartAccount,
  type MetaMaskSmartAccount,
} from '@metamask/delegation-toolkit';
import {
  encodeExecutionCalldatas,
  encodePermissionContexts,
  SINGLE_DEFAULT_MODE,
} from '@metamask/delegation-toolkit/utils';

import {
  transport,
  gasPrice,
  sponsoredBundlerClient,
  deploySmartAccount,
  publicClient,
  fundAddress,
  deployCounter,
} from '../utils/helpers';
import CounterMetadata from '../utils/counter/metadata.json';
import { Address, createClient, encodeFunctionData, parseEther } from 'viem';
import { expectUserOperationToSucceed } from '../utils/assertions';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { chain } from '../../src/config';

const oneHour = 3600;
const twoHours = 2 * oneHour;
const threeHours = 3 * oneHour;

let aliceSmartAccount: MetaMaskSmartAccount<Implementation.Hybrid>;
let bobSmartAccount: MetaMaskSmartAccount<Implementation.Hybrid>;
let aliceCounterAddress: Address;
let currentTimestamp: number;

beforeEach(async () => {
  const client = createClient({ transport, chain });
  const alice = privateKeyToAccount(generatePrivateKey());
  const bob = privateKeyToAccount(generatePrivateKey());

  aliceSmartAccount = await toMetaMaskSmartAccount({
    client,
    implementation: Implementation.Hybrid,
    deployParams: [alice.address, [], [], []],
    deploySalt: '0x1',
    signatory: { account: alice },
  });

  await deploySmartAccount(aliceSmartAccount);
  await fundAddress(aliceSmartAccount.address, parseEther('2'));

  bobSmartAccount = await toMetaMaskSmartAccount({
    client,
    implementation: Implementation.Hybrid,
    deployParams: [bob.address, [], [], []],
    deploySalt: '0x1',
    signatory: { account: bob },
  });

  const aliceCounter = await deployCounter(aliceSmartAccount.address);
  aliceCounterAddress = aliceCounter.address;
  const { timestamp } = await publicClient.getBlock({ blockTag: 'latest' });
  // todo: simulation fails if we use the exact timestamp. Current theory is that the simulation is
  // performed on the latest block, rather than a new block.
  currentTimestamp = Number(timestamp) - 1;
});

test('maincase: Bob redeems the delegation within the specified timestamp range', async () => {
  const afterThreshold = currentTimestamp;
  const beforeThreshold = currentTimestamp + oneHour;

  await runTest_expectSuccess(1n, afterThreshold, beforeThreshold);
});

test('Bob redeems the delegation with only afterThreshold specified', async () => {
  const afterThreshold = currentTimestamp;
  const beforeThreshold = 0;

  await runTest_expectSuccess(2n, afterThreshold, beforeThreshold);
});

test('Bob redeems the delegation with only beforeThreshold specified', async () => {
  const afterThreshold = 0;
  const beforeThreshold = currentTimestamp + oneHour;

  await runTest_expectSuccess(3n, afterThreshold, beforeThreshold);
});

test('Bob redeems the delegation at the exact afterThreshold', async () => {
  const afterThreshold = currentTimestamp;
  const beforeThreshold = currentTimestamp + oneHour;

  await runTest_expectSuccess(4n, afterThreshold, beforeThreshold);
});

test('Bob attempts to redeem the delegation before the afterThreshold', async () => {
  const afterThreshold = currentTimestamp + oneHour;
  const beforeThreshold = currentTimestamp + twoHours;

  await runTest_expectFailure(
    4n,
    afterThreshold,
    beforeThreshold,
    'TimestampEnforcer:early-delegation',
  );
});

test('Bob attempts to redeem the delegation after the beforeThreshold', async () => {
  const afterThreshold = currentTimestamp - twoHours;
  const beforeThreshold = currentTimestamp - oneHour;

  await runTest_expectFailure(
    5n,
    afterThreshold,
    beforeThreshold,
    'TimestampEnforcer:expired-delegation',
  );
});

test('Bob attempts to redeem the delegation with afterThreshold in the future', async () => {
  const afterThreshold = currentTimestamp + twoHours;
  const beforeThreshold = currentTimestamp + threeHours;

  await runTest_expectFailure(
    6n,
    afterThreshold,
    beforeThreshold,
    'TimestampEnforcer:early-delegation',
  );
});

test('Bob attempts to redeem the delegation with beforeThreshold in the past', async () => {
  const afterThreshold = currentTimestamp - threeHours;
  const beforeThreshold = currentTimestamp - twoHours;

  await runTest_expectFailure(
    7n,
    afterThreshold,
    beforeThreshold,
    'TimestampEnforcer:expired-delegation',
  );
});

const runTest_expectSuccess = async (
  newCount: bigint,
  afterThreshold: number,
  beforeThreshold: number,
) => {
  const bobAddress = bobSmartAccount.address;
  const aliceAddress = aliceSmartAccount.address;

  const delegation = createDelegation({
    to: bobAddress,
    from: aliceAddress,
    caveats: createCaveatBuilder(aliceSmartAccount.environment).addCaveat(
      'timestamp',
      afterThreshold,
      beforeThreshold,
    ),
  });

  const signedDelegation = {
    ...delegation,
    signature: await aliceSmartAccount.signDelegation({
      delegation,
    }),
  };

  const execution = createExecution({
    target: aliceCounterAddress,
    callData: encodeFunctionData({
      abi: CounterMetadata.abi,
      functionName: 'setCount',
      args: [newCount],
    }),
  });

  const redeemData = encodeFunctionData({
    abi: bobSmartAccount.abi,
    functionName: 'redeemDelegations',
    args: [
      encodePermissionContexts([[signedDelegation]]),
      [SINGLE_DEFAULT_MODE],
      encodeExecutionCalldatas([[execution]]),
    ],
  });

  const countBefore = await publicClient.readContract({
    address: aliceCounterAddress,
    abi: CounterMetadata.abi,
    functionName: 'count',
  });
  expect(countBefore, 'Expected initial count to be 0n').toEqual(0n);

  const userOpHash = await sponsoredBundlerClient.sendUserOperation({
    account: bobSmartAccount,
    calls: [
      {
        to: bobSmartAccount.address,
        data: redeemData,
      },
    ],
    ...gasPrice,
  });

  const receipt = await sponsoredBundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  expectUserOperationToSucceed(receipt);

  const countAfter = await publicClient.readContract({
    address: aliceCounterAddress,
    abi: CounterMetadata.abi,
    functionName: 'count',
  });
  expect(countAfter, `Expected final count to be ${newCount}`).toEqual(
    newCount,
  );
};

const runTest_expectFailure = async (
  newCount: bigint,
  afterThreshold: number,
  beforeThreshold: number,
  expectedError: string,
) => {
  const bobAddress = bobSmartAccount.address;
  const aliceAddress = aliceSmartAccount.address;

  const delegation = createDelegation({
    to: bobAddress,
    from: aliceAddress,
    caveats: createCaveatBuilder(aliceSmartAccount.environment).addCaveat(
      'timestamp',
      afterThreshold,
      beforeThreshold,
    ),
  });

  const signedDelegation = {
    ...delegation,
    signature: await aliceSmartAccount.signDelegation({
      delegation,
    }),
  };

  const execution = createExecution({
    target: aliceCounterAddress,
    callData: encodeFunctionData({
      abi: CounterMetadata.abi,
      functionName: 'setCount',
      args: [newCount],
    }),
  });

  const redeemData = encodeFunctionData({
    abi: bobSmartAccount.abi,
    functionName: 'redeemDelegations',
    args: [
      encodePermissionContexts([[signedDelegation]]),
      [SINGLE_DEFAULT_MODE],
      encodeExecutionCalldatas([[execution]]),
    ],
  });

  const countBefore = await publicClient.readContract({
    address: aliceCounterAddress,
    abi: CounterMetadata.abi,
    functionName: 'count',
  });
  expect(countBefore, 'Expected initial count to be 0n').toEqual(0n);

  await expect(
    sponsoredBundlerClient.sendUserOperation({
      account: bobSmartAccount,
      calls: [
        {
          to: bobSmartAccount.address,
          data: redeemData,
        },
      ],
      ...gasPrice,
    }),
  ).rejects.toThrow(expectedError);

  const countAfter = await publicClient.readContract({
    address: aliceCounterAddress,
    abi: CounterMetadata.abi,
    functionName: 'count',
  });
  expect(countAfter, 'Expected count to remain 0n').toEqual(0n);
};
