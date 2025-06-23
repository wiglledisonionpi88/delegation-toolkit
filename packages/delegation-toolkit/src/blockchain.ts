import { CHAIN_ID } from '@metamask/delegation-deployments';

const CHAIN_EXPLORERS = {
  [CHAIN_ID.mainnet]: 'https://etherscan.io',
  [CHAIN_ID.optimism]: 'https://optimistic.etherscan.io',
  [CHAIN_ID.polygon]: 'https://polygonscan.com',
  [CHAIN_ID.base]: 'https://basescan.org',
  [CHAIN_ID.arbitrum]: 'https://arbiscan.io',
  [CHAIN_ID.linea]: 'https://lineascan.build',
  [CHAIN_ID.sepolia]: 'https://sepolia.etherscan.io',
  [CHAIN_ID.lineaSepolia]: 'https://sepolia.lineascan.build',
};

const getExplorerLink = (chainId: number) => {
  const url = CHAIN_EXPLORERS[chainId];
  if (!url) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }
  return url;
};

export const getExplorerAddressLink = (chainId: number, address: string) => {
  const prefix = getExplorerLink(chainId);
  return `${prefix}/address/${address}`;
};

export const getExplorerTransactionLink = (chainId: number, hash: string) => {
  const prefix = getExplorerLink(chainId);
  return `${prefix}/tx/${hash}`;
};

export const shortenHash = (address: string | undefined) =>
  address ? `${address.slice(0, 6)}...` : '';

export const getInfuraRpcUrl = (chainId: number, apiKey?: string) => {
  if (!apiKey) {
    throw new Error('Infura API key is required');
  }
  switch (chainId) {
    case CHAIN_ID.mainnet:
      return `https://mainnet.infura.io/v3/${apiKey}`;
    case CHAIN_ID.optimism:
      return `https://optimism-mainnet.infura.io/v3/${apiKey}`;
    case CHAIN_ID.polygon:
      return `https://polygon-mainnet.infura.io/v3/${apiKey}`;
    case CHAIN_ID.arbitrum:
      return `https://arbitrum-mainnet.infura.io/v3/${apiKey}`;
    case CHAIN_ID.linea:
      return `https://linea-mainnet.infura.io/v3/${apiKey}`;
    case CHAIN_ID.sepolia:
      return `https://sepolia.infura.io/v3/${apiKey}`;
    case CHAIN_ID.lineaSepolia:
      return `https://linea-sepolia.infura.io/v3/${apiKey}`;
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
};
