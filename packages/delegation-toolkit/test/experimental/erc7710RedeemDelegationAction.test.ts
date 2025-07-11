import { DelegationManager } from '@metamask/delegation-abis';
import { expect } from 'chai';
import hre from 'hardhat';
import { stub } from 'sinon';
import type {
  Account,
  Chain,
  PublicClient,
  Transport,
  WalletClient,
} from 'viem';
import {
  createClient,
  createWalletClient,
  custom,
  encodeFunctionData,
} from 'viem';
import { createBundlerClient } from 'viem/account-abstraction';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { hardhat } from 'viem/chains';

import { Implementation } from '../../src/constants';
import { overrideDeployedEnvironment } from '../../src/delegatorEnvironment';
import {
  createExecution,
  encodeExecutionCalldatas,
  SINGLE_DEFAULT_MODE,
} from '../../src/executions';
import {
  erc7710BundlerActions,
  erc7710WalletActions,
} from '../../src/experimental';
import type {
  SendTransactionWithDelegationParameters,
  SendUserOperationWithDelegationParameters,
} from '../../src/experimental/erc7710RedeemDelegationAction';
import { toMetaMaskSmartAccount } from '../../src/toMetaMaskSmartAccount';
import type {
  DeleGatorEnvironment,
  MetaMaskSmartAccount,
} from '../../src/types';
import { createHardhatTransport, randomAddress, randomBytes } from '../utils';

describe('erc7710RedeemDelegationAction', () => {
  describe('sendUserOperationWithDelegationAction()', () => {
    const mockBundlerRequest = stub();
    let publicClient: PublicClient<Transport, Chain>;
    const simpleFactoryAddress = randomAddress();

    const owner = privateKeyToAccount(generatePrivateKey());
    let metaMaskSmartAccount: MetaMaskSmartAccount<Implementation.MultiSig>;

    beforeEach(async () => {
      mockBundlerRequest.reset();
      publicClient = await hre.viem.getPublicClient();
      overrideDeployedEnvironment(publicClient.chain.id, '1.3.0', {
        SimpleFactory: simpleFactoryAddress,
        implementations: {
          MultiSigDeleGatorImpl: randomAddress(),
        },
      } as any as DeleGatorEnvironment);

      metaMaskSmartAccount = await toMetaMaskSmartAccount({
        client: createClient({
          transport: await createHardhatTransport(),
          chain: publicClient.chain,
        }),
        implementation: Implementation.MultiSig,
        signatory: [{ account: owner }],
        deployParams: [[owner.address], 1n],
        deploySalt: randomBytes(32),
      });
    });

    it('should call sendUserOperation() with the specified parameters', async () => {
      const bundlerClient = createBundlerClient({
        transport: custom({ request: mockBundlerRequest }),
        chain: publicClient.chain,
        account: metaMaskSmartAccount,
      });
      const extendedBundlerClient = bundlerClient.extend(
        erc7710BundlerActions(),
      );

      const sendUserOperationStub = stub(bundlerClient, 'sendUserOperation');

      const sendUserOperationWithDelegationArgs: SendUserOperationWithDelegationParameters<
        MetaMaskSmartAccount<Implementation.MultiSig>
      > = {
        calls: [{ to: randomAddress(), value: 0n }],
        publicClient,
      };

      await extendedBundlerClient.sendUserOperationWithDelegation(
        sendUserOperationWithDelegationArgs,
      );

      expect(sendUserOperationStub.firstCall.args[0]).to.deep.equal(
        sendUserOperationWithDelegationArgs,
      );
    });

    it('should append factory calls when accountMetadata is provided', async () => {
      const bundlerClient = createBundlerClient({
        transport: custom({ request: mockBundlerRequest }),
        chain: publicClient.chain,
      });
      const extendedBundlerClient = bundlerClient.extend(
        erc7710BundlerActions(),
      );

      const sendUserOperationStub = stub(bundlerClient, 'sendUserOperation');

      const calls = [
        {
          to: randomAddress(),
          value: 0n,
        },
      ];

      const accountMetadata = [
        {
          factory: simpleFactoryAddress,
          factoryData: randomBytes(128),
        },
        {
          factory: simpleFactoryAddress,
          factoryData: randomBytes(128),
        },
      ];
      const sendUserOperationWithDelegationArgs: SendUserOperationWithDelegationParameters =
        {
          publicClient,
          calls,
          accountMetadata,
        };

      await extendedBundlerClient.sendUserOperationWithDelegation(
        sendUserOperationWithDelegationArgs,
      );

      expect(sendUserOperationStub.firstCall.args[0]).to.deep.equal({
        ...sendUserOperationWithDelegationArgs,
        calls: [
          {
            to: accountMetadata[0]?.factory,
            data: accountMetadata[0]?.factoryData,
            value: 0n,
          },
          {
            to: accountMetadata[1]?.factory,
            data: accountMetadata[1]?.factoryData,
            value: 0n,
          },
          ...calls,
        ],
      });
    });

    it('should throw an error when SimpleFactory is provided as accountMetadata factory', async () => {
      const bundlerClient = createBundlerClient({
        transport: custom({ request: mockBundlerRequest }),
        chain: publicClient.chain,
      });
      const extendedBundlerClient = bundlerClient.extend(
        erc7710BundlerActions(),
      );

      const calls = [
        {
          to: randomAddress(),
          value: 0n,
        },
      ];

      const accountMetadata = [
        {
          factory: randomAddress(),
          factoryData: randomBytes(128),
        },
      ];

      const sendUserOperationWithDelegationArgs: SendUserOperationWithDelegationParameters =
        {
          publicClient,
          calls,
          accountMetadata,
        };

      const factoryAddress = accountMetadata[0]?.factory;

      if (!factoryAddress) {
        throw new Error('factoryAddress is not set');
      }

      await expect(
        extendedBundlerClient.sendUserOperationWithDelegation(
          sendUserOperationWithDelegationArgs,
        ),
      ).to.be.rejectedWith(
        `Invalid accountMetadata: ${factoryAddress} is not allowed.`,
      );
    });

    it('should not append factory calls for accounts that are already deployed', async () => {
      const bundlerClient = createBundlerClient({
        transport: custom({ request: mockBundlerRequest }),
        chain: publicClient.chain,
      });
      const extendedBundlerClient = bundlerClient.extend(
        erc7710BundlerActions(),
      );

      const sendUserOperationStub = stub(bundlerClient, 'sendUserOperation');

      const calls = [
        {
          to: randomAddress(),
          value: 0n,
        },
      ];

      const accountMetadata = [
        {
          factory: simpleFactoryAddress,
          factoryData: randomBytes(128),
        },
      ];

      const mockPublicClient = {
        ...publicClient,
        call: stub(),
      };

      mockPublicClient.call.rejects('Contract already deployed');

      const sendUserOperationWithDelegationArgs: SendUserOperationWithDelegationParameters =
        {
          publicClient: mockPublicClient as unknown as PublicClient<
            Transport,
            Chain
          >,
          calls,
          accountMetadata,
        };

      await extendedBundlerClient.sendUserOperationWithDelegation(
        sendUserOperationWithDelegationArgs,
      );

      expect(mockPublicClient.call.firstCall.args[0]).to.deep.equal({
        to: accountMetadata[0]?.factory,
        data: accountMetadata[0]?.factoryData,
      });

      expect(sendUserOperationStub.firstCall.args[0]).to.deep.equal({
        ...sendUserOperationWithDelegationArgs,
        calls,
      });
    });
  });

  describe('sendTransactionWithDelegationAction()', () => {
    let walletClient: WalletClient<Transport, Chain, Account>;
    let account: Account;

    beforeEach(async () => {
      const transport = await createHardhatTransport();

      account = privateKeyToAccount(generatePrivateKey());
      walletClient = createWalletClient({
        account,
        chain: hardhat,
        transport,
      });
    });

    it('should encode the calldata with the specified parameters', async () => {
      const extendedWalletClient = walletClient.extend(erc7710WalletActions());

      const sendTransaction = stub(walletClient, 'sendTransaction');

      const args: SendTransactionWithDelegationParameters = {
        account,
        chain: hardhat,
        to: randomAddress(),
        value: 0n,
        data: randomBytes(128),
        permissionsContext: randomBytes(128),
        delegationManager: randomAddress(),
      };

      await extendedWalletClient.sendTransactionWithDelegation(args);

      if (!args.to) {
        throw new Error('to is not set');
      }

      const redeemDelegationCallData = encodeFunctionData({
        abi: DelegationManager.abi,
        functionName: 'redeemDelegations',
        args: [
          [args.permissionsContext],
          [SINGLE_DEFAULT_MODE],
          encodeExecutionCalldatas([
            [
              createExecution({
                target: args.to,
                value: args.value,
                callData: args.data,
              }),
            ],
          ]),
        ],
      });

      const expectedArgs = {
        ...args,
        to: args.delegationManager,
        data: redeemDelegationCallData,
      };

      expect(sendTransaction.calledOnceWithExactly(expectedArgs)).to.equal(
        true,
      );
    });

    it('should throw an error when `to` is not provided', async () => {
      const extendedWalletClient = walletClient.extend(erc7710WalletActions());

      await expect(
        extendedWalletClient.sendTransactionWithDelegation({
          account,
          chain: hardhat,
          value: 0n,
          data: randomBytes(128),
          permissionsContext: randomBytes(128),
          delegationManager: randomAddress(),
        }),
      ).to.be.rejectedWith(
        '`to` is required. `sendTransactionWithDelegation` cannot be used to deploy contracts.',
      );
    });
  });
});
