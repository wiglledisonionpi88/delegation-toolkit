# DeleGator SDK Monorepo

This monorepo consists of a suite of tools to enable developers to build using the MetaMask Delegation system and DeleGator Smart Contract Accounts.

### Project Structure

- `./packages` contains top level packages that will be deployed for external use
  - `/delegation-abis` a bundle of ABIs mapping to a specific version of the [Delegation Framework](https://github.com/metamask/delegation-framework).
  - `/delegation-deployments` a history of deployments of various versions of the [Delegation Framework](https://github.com/metamask/delegation-framework).
  - `/delegation-toolkit` utilities for interacting with a [DeleGator SCA](https://github.com/MetaMask/delegation-framework/blob/main/documents/HybridDeleGator.md) as a viem [Wallet Client](https://viem.sh/docs/clients/wallet#wallet-client).
  - `/delegator-e2e` end-to-end tests for the Delegation Toolkit.
- `./shared` contains simple shared resources for configuring and testing the packages.

## Development

### Quick Start

```sh
yarn install && yarn dev
```

### Contributing

See the contribution guide [here](/CONTRIBUTING.md)

## Useful Links

- [Viem](https://viem.sh/)
- [Wagmi](https://wagmi.sh/)
- [Turbo Repo](https://turbo.build/repo/docs)
- [Turbo Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [EIP-712](https://eips.ethereum.org/EIPS/eip-712)
- [EIP-1014](https://eips.ethereum.org/EIPS/eip-1014)
- [EIP-1271](https://eips.ethereum.org/EIPS/eip-1271)
- [EIP-1822](https://eips.ethereum.org/EIPS/eip-1822)
- [EIP-1967](https://eips.ethereum.org/EIPS/eip-1967)
- [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337)
- [EIP-7201](https://eips.ethereum.org/EIPS/eip-7201)
- ERC-7710
- ERC-7715
- [EIP-7212](https://eips.ethereum.org/EIPS/eip-7212)
