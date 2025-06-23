import { concat } from 'viem';
import type {
  Address,
  SignableMessage,
  TypedData,
  TypedDataDefinition,
} from 'viem';
import type { SignReturnType as WebAuthnSignReturnType } from 'webauthn-p256';

import { Implementation } from './constants';
import { aggregateSignature } from './signatures';
import type {
  AccountSignatoryConfig,
  HybridSignatoryConfig,
  InternalSignatory,
  MultiSigSignatoryConfig,
  SignatoryConfigByImplementation,
  Stateless7702SignatoryConfig,
  WalletSignatoryConfig,
} from './types';
import {
  createDummyWebAuthnSignature,
  encodeDeleGatorSignature,
} from './webAuthn';

// A valid ECDSA signature, this must be able to ecrecover an address, otherwise the contracts will revert in isValidSignature
const EOA_STUB_SIGNATURE =
  '0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000011b' as const;

const resolveSignatoryFromWalletConfig = (
  config: WalletSignatoryConfig,
): InternalSignatory => {
  return {
    signMessage: config.walletClient.signMessage,
    signTypedData: async (typedData) => {
      // todo: figure out this type so that we don't need the type assertion
      return config.walletClient.signTypedData(typedData as any);
    },
    getStubSignature: async () => EOA_STUB_SIGNATURE,
  };
};

const resolveSignatoryFromAccountConfig = (config: AccountSignatoryConfig) => {
  return {
    signMessage: config.account.signMessage,
    signTypedData: config.account.signTypedData,
    getStubSignature: async () => EOA_STUB_SIGNATURE,
  };
};

const resolveHybridSignatory = (
  config: HybridSignatoryConfig,
): InternalSignatory => {
  if ('walletClient' in config) {
    return resolveSignatoryFromWalletConfig(config);
  } else if ('account' in config) {
    const { signMessage, signTypedData, getStubSignature } =
      resolveSignatoryFromAccountConfig(config);
    if (!signMessage) {
      throw new Error('Account does not support signMessage');
    }
    if (!signTypedData) {
      throw new Error('Account does not support signTypedData');
    }
    return {
      signMessage,
      signTypedData,
      getStubSignature,
    };
  }
  const { keyId, webAuthnAccount } = config;

  if (webAuthnAccount.type !== 'webAuthn') {
    throw new Error('Account is not a webAuthn account');
  }

  const encodeSignature = ({ signature, webauthn }: WebAuthnSignReturnType) =>
    encodeDeleGatorSignature(
      keyId,
      signature,
      webauthn.clientDataJSON,
      webauthn.authenticatorData,
    );

  const signMessage = async (args: { message: SignableMessage }) =>
    webAuthnAccount.signMessage(args).then(encodeSignature);
  const signTypedData = async <
    const TTypedData extends TypedData | Record<string, unknown>,
    TPrimaryType extends keyof TTypedData | 'EIP712Domain' = keyof TTypedData,
  >(
    typedDataDefinition: TypedDataDefinition<TTypedData, TPrimaryType>,
  ) => webAuthnAccount.signTypedData(typedDataDefinition).then(encodeSignature);

  const getStubSignature = async () => createDummyWebAuthnSignature(keyId);

  return {
    signMessage,
    signTypedData,
    getStubSignature,
  };
};

const resolveMultiSigSignatory = (
  config: MultiSigSignatoryConfig,
): InternalSignatory => {
  const resolvedSignatories = config.map((signatory) => {
    let individualSignMessage: InternalSignatory['signMessage'];
    let individualSignTypedData: InternalSignatory['signTypedData'];
    let address: Address;
    if ('walletClient' in signatory) {
      const { signMessage, signTypedData } =
        resolveSignatoryFromWalletConfig(signatory);
      individualSignMessage = signMessage;
      individualSignTypedData = signTypedData;

      address = signatory.walletClient.account.address;
    } else {
      const { signMessage, signTypedData } =
        resolveSignatoryFromAccountConfig(signatory);
      if (!signMessage) {
        throw new Error('Account does not support signMessage');
      }
      if (!signTypedData) {
        throw new Error('Account does not support signTypedData');
      }

      individualSignMessage = signMessage;
      individualSignTypedData = signTypedData;

      address = signatory.account.address;
    }
    return {
      address,
      individualSignMessage,
      individualSignTypedData,
    };
  });

  const signMessage = async (args: { message: SignableMessage }) => {
    const addressAndSignatures = resolvedSignatories.map(
      async ({ individualSignMessage, address }) => ({
        signature: await individualSignMessage(args),
        signer: address,
        type: 'ECDSA' as const,
      }),
    );

    const signatures = await Promise.all(addressAndSignatures);

    return aggregateSignature({
      signatures,
    });
  };

  const signTypedData = async <
    const TTypedData extends TypedData | Record<string, unknown>,
    TPrimaryType extends keyof TTypedData | 'EIP712Domain' = keyof TTypedData,
  >(
    typedDataDefinition: TypedDataDefinition<TTypedData, TPrimaryType>,
  ) => {
    const addressAndSignatures = resolvedSignatories.map(
      async ({ individualSignTypedData, address }) => ({
        signature: await individualSignTypedData(typedDataDefinition),
        signer: address,
        type: 'ECDSA' as const,
      }),
    );

    const signatures = await Promise.all(addressAndSignatures);

    return aggregateSignature({
      signatures,
    });
  };

  const getStubSignature = async () =>
    concat(resolvedSignatories.map(() => EOA_STUB_SIGNATURE));

  return {
    signMessage,
    signTypedData,
    getStubSignature,
  };
};

const resolveStateless7702Signatory = (
  config: Stateless7702SignatoryConfig,
): InternalSignatory => {
  if ('walletClient' in config) {
    return resolveSignatoryFromWalletConfig(config);
  } else if ('account' in config) {
    const { signMessage, signTypedData, getStubSignature } =
      resolveSignatoryFromAccountConfig(config);
    if (!signMessage) {
      throw new Error('Account does not support signMessage');
    }
    if (!signTypedData) {
      throw new Error('Account does not support signTypedData');
    }

    return {
      signMessage,
      signTypedData,
      getStubSignature,
    };
  }

  throw new Error('Invalid signatory config');
};

export const resolveSignatory = <
  TImplementation extends Implementation,
>(config: {
  implementation: TImplementation;
  signatory: SignatoryConfigByImplementation<TImplementation>;
}): InternalSignatory => {
  const { implementation } = config;

  if (implementation === Implementation.Hybrid) {
    return resolveHybridSignatory(config.signatory as HybridSignatoryConfig);
  } else if (implementation === Implementation.MultiSig) {
    return resolveMultiSigSignatory(
      config.signatory as MultiSigSignatoryConfig,
    );
  } else if (implementation === Implementation.Stateless7702) {
    return resolveStateless7702Signatory(
      config.signatory as Stateless7702SignatoryConfig,
    );
  }
  throw new Error(`Implementation type '${implementation}' not supported`);
};
