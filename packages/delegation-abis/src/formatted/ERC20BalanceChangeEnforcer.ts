export const abi = [
  {
    "type": "function",
    "name": "afterAllHook",
    "inputs": [
      {
        "name": "",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "",
        "type": "bytes32",
        "internalType": "ModeCode"
      },
      {
        "name": "",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "afterHook",
    "inputs": [
      {
        "name": "_terms",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "",
        "type": "bytes32",
        "internalType": "ModeCode"
      },
      {
        "name": "",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "_delegationHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "balanceCache",
    "inputs": [
      {
        "name": "hashKey",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "balance",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "beforeAllHook",
    "inputs": [
      {
        "name": "",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "",
        "type": "bytes32",
        "internalType": "ModeCode"
      },
      {
        "name": "",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "beforeHook",
    "inputs": [
      {
        "name": "_terms",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "_mode",
        "type": "bytes32",
        "internalType": "ModeCode"
      },
      {
        "name": "",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "_delegationHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getHashKey",
    "inputs": [
      {
        "name": "_caller",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_token",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_delegationHash",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "getTermsInfo",
    "inputs": [
      {
        "name": "_terms",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [
      {
        "name": "enforceDecrease_",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "token_",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "recipient_",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amount_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "isLocked",
    "inputs": [
      {
        "name": "hashKey",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "lock",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  }
] as const;


export const bytecode = "0x608060405234801561001057600080fd5b5061095e806100206000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c8063b5e544921161005b578063b5e5449214610115578063b99deb0e14610135578063d3eddcc51461017a578063ed463367146100c557600080fd5b806332a16f4e1461008d578063414c3e33146100c55780638678d6ef146100e1578063a145832a14610102575b600080fd5b6100b061009b366004610677565b60016020526000908152604090205460ff1681565b60405190151581526020015b60405180910390f35b6100df6100d33660046106f5565b50505050505050505050565b005b6100f46100ef3660046107c2565b61018d565b6040519081526020016100bc565b6100df6101103660046106f5565b6101a2565b6100f4610123366004610677565b60006020819052908152604090205481565b6101486101433660046107fe565b610353565b6040516100bc949392919093151584526001600160a01b03928316602085015291166040830152606082015260800190565b6100df6101883660046106f5565b610440565b600061019a84848461061d565b949350505050565b85600881901b6101b3816000610660565b6102125760405162461bcd60e51b815260206004820152602560248201527f436176656174456e666f726365723a696e76616c69642d657865637574696f6e6044820152642d7479706560d81b60648201526084015b60405180910390fd5b506000806102208d8d610353565b509250925050600061023333848961061d565b60008181526001602052604090205490915060ff16156102ab5760405162461bcd60e51b815260206004820152602d60248201527f455243323042616c616e63654368616e6765456e666f726365723a656e666f7260448201526c18d95c8b5a5ccb5b1bd8dad959609a1b6064820152608401610209565b6000818152600160208190526040808320805460ff1916909217909155516370a0823160e01b81526001600160a01b0384811660048301528516906370a0823190602401602060405180830381865afa15801561030c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103309190610840565b600092835260208390526040909220919091555050505050505050505050505050565b6000808080604985146103c05760405162461bcd60e51b815260206004820152602f60248201527f455243323042616c616e63654368616e6765456e666f726365723a696e76616c60448201526e0d2c85ae8cae4dae65ad8cadccee8d608b1b6064820152608401610209565b858560008181106103d3576103d3610859565b909101356001600160f81b031916151594506103f5905060156001878961086f565b6103fe91610899565b60601c925061041160296015878961086f565b61041a91610899565b60601c915061042c856029818961086f565b610435916108ce565b939692955090935050565b6000806000806104508e8e610353565b9350935093509350600061046533858a61061d565b600081815260016020526040808220805460ff19169055516370a0823160e01b81526001600160a01b03868116600483015292935090918616906370a0823190602401602060405180830381865afa1580156104c5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104e99190610840565b9050851561057c5760008281526020819052604090205461050b908490610902565b8110156105775760405162461bcd60e51b815260206004820152603460248201527f455243323042616c616e63654368616e6765456e666f726365723a65786365656044820152736465642d62616c616e63652d646563726561736560601b6064820152608401610209565b61060b565b600082815260208190526040902054610596908490610915565b81101561060b5760405162461bcd60e51b815260206004820152603860248201527f455243323042616c616e63654368616e6765456e666f726365723a696e73756660448201527f66696369656e742d62616c616e63652d696e63726561736500000000000000006064820152608401610209565b50505050505050505050505050505050565b604080516001600160a01b039485166020808301919091529390941684820152606080850192909252805180850390920182526080909301909252815191012090565b6001600160f81b0319828116908216145b92915050565b60006020828403121561068957600080fd5b5035919050565b60008083601f8401126106a257600080fd5b50813567ffffffffffffffff8111156106ba57600080fd5b6020830191508360208285010111156106d257600080fd5b9250929050565b80356001600160a01b03811681146106f057600080fd5b919050565b60008060008060008060008060008060e08b8d03121561071457600080fd5b8a3567ffffffffffffffff8082111561072c57600080fd5b6107388e838f01610690565b909c509a5060208d013591508082111561075157600080fd5b61075d8e838f01610690565b909a50985060408d0135975060608d013591508082111561077d57600080fd5b5061078a8d828e01610690565b90965094505060808b013592506107a360a08c016106d9565b91506107b160c08c016106d9565b90509295989b9194979a5092959850565b6000806000606084860312156107d757600080fd5b6107e0846106d9565b92506107ee602085016106d9565b9150604084013590509250925092565b6000806020838503121561081157600080fd5b823567ffffffffffffffff81111561082857600080fd5b61083485828601610690565b90969095509350505050565b60006020828403121561085257600080fd5b5051919050565b634e487b7160e01b600052603260045260246000fd5b6000808585111561087f57600080fd5b8386111561088c57600080fd5b5050820193919092039150565b6bffffffffffffffffffffffff1981358181169160148510156108c65780818660140360031b1b83161692505b505092915050565b8035602083101561067157600019602084900360031b1b1692915050565b634e487b7160e01b600052601160045260246000fd5b81810381811115610671576106716108ec565b80820180821115610671576106716108ec56fea26469706673582212202ee065285e6d78b8f4f72189bef225cff106ed6fed2f250af767e847d4faa24364736f6c63430008170033" as const;