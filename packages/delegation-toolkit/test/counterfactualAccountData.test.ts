import { expect } from 'chai';
import hre from 'hardhat';
import { isHex } from 'viem';
import type { WalletClient, PublicClient, Hex } from 'viem';
import { hardhat as chain } from 'viem/chains';

import {
  setupDevelopmentEnvironment,
  OWNER_ACCOUNT,
  invokeFactoryData,
  randomBytes,
} from './utils';
import { Implementation } from '../src/constants';
import { getCounterfactualAccountData } from '../src/counterfactualAccountData';
import type { DeleGatorEnvironment } from '../src/types';

describe('getCounterfactualAccountData', () => {
  let environment: DeleGatorEnvironment;

  let walletClient: WalletClient;
  let publicClient: PublicClient;

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    walletClient = (await hre.viem.getWalletClients())[0]!;

    publicClient = await hre.viem.getPublicClient();
    environment = await setupDevelopmentEnvironment(
      walletClient,
      publicClient,
      chain,
    );
  });

  it('should generate correct counterfactual account data for Hybrid implementation', async () => {
    const deploySalt: Hex = randomBytes(32);

    const result = await getCounterfactualAccountData({
      factory: environment.SimpleFactory,
      implementations: environment.implementations,
      implementation: Implementation.Hybrid,
      deployParams: [OWNER_ACCOUNT.address, [], [], []],
      deploySalt,
    });

    expect(isHex(result.address)).to.equal(true);
    expect(isHex(result.factoryData)).to.equal(true);

    const codeBefore = await publicClient.getCode({
      address: result.address,
    });

    expect(codeBefore).to.equal(undefined);

    const txHash = await invokeFactoryData(
      walletClient,
      chain,
      environment.SimpleFactory,
      result.factoryData,
    );

    await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    const codeAfter = await publicClient.getCode({
      address: result.address,
    });

    expect(codeAfter).to.not.equal('0x');
  });

  it('should generate correct counterfactual account data for MultiSig implementation', async () => {
    const deploySalt: Hex = randomBytes(32);

    const result = await getCounterfactualAccountData({
      factory: environment.SimpleFactory,
      implementations: environment.implementations,
      implementation: Implementation.MultiSig,
      deployParams: [[OWNER_ACCOUNT.address], 1n],
      deploySalt,
    });

    expect(isHex(result.address)).to.equal(true);
    expect(isHex(result.factoryData)).to.equal(true);

    const codeBefore = await publicClient.getCode({
      address: result.address,
    });

    expect(codeBefore).to.equal(undefined);

    const txHash = await invokeFactoryData(
      walletClient,
      chain,
      environment.SimpleFactory,
      result.factoryData,
    );

    await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    const codeAfter = await publicClient.getCode({
      address: result.address,
    });

    expect(codeAfter).to.not.equal('0x');
  });

  it('should throw an error for unsupported implementation', async () => {
    const deploySalt: Hex = '0x3';

    await expect(
      getCounterfactualAccountData({
        factory: environment.SimpleFactory,
        implementations: environment.implementations,
        implementation: 99 as any as Implementation,
        deployParams: [OWNER_ACCOUNT.address, [], [], []],
        deploySalt,
      }),
    ).to.be.rejectedWith("Implementation type '99' not supported");
  });

  it('should throw an error for Stateless7702 implementation (not supported for counterfactual accounts)', async () => {
    const deploySalt: Hex = randomBytes(32);

    await expect(
      getCounterfactualAccountData({
        factory: environment.SimpleFactory,
        implementations: environment.implementations,
        implementation: Implementation.Stateless7702,
        deployParams: null,
        deploySalt,
      } as any),
    ).to.be.rejectedWith("Implementation type 'Stateless7702' not supported");
  });
});
