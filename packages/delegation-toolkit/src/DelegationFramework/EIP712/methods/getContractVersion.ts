import type { Client, Address } from 'viem';
import { readContract } from 'viem/actions';

// NOTE: ABIs have been extracted and minimized for reuse across contracts. These methods are included in our contracts but are not a part of the EIP712 standard itself.

export type ReadGetContractVersionParameters = {
  client: Client;
  contractAddress: Address;
};

export const read = async ({
  client,
  contractAddress,
}: ReadGetContractVersionParameters) =>
  await readContract(client, {
    address: contractAddress,
    abi: [
      {
        type: 'function',
        name: 'VERSION',
        inputs: [],
        outputs: [
          {
            name: '',
            type: 'string',
            internalType: 'string',
          },
        ],
        stateMutability: 'view',
      },
    ],
    functionName: 'VERSION',
  });
