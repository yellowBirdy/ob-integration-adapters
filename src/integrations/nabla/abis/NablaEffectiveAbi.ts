export const NablaEffectiveAbi = [
    // SWAP POOL EVENTS
    {
      "type": "event",
      "name": "SwapFeesSet",
      "inputs": [
        {
          "name": "sender",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "lpFee",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "backstopFee",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "protocolFee",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ReserveUpdated",
      "inputs": [
        {
          "name": "newReserve",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "newReserveWithSlippage",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "newTotalLiabilities",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    // PORTAL EVENTS
    {
        "type": "event",
        "name": "AssetRegistered",
        "inputs": [
          {
            "name": "sender",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "router",
            "type": "address",
            "indexed": false,
            "internalType": "address"
          },
          {
            "name": "asset",
            "type": "address",
            "indexed": false,
            "internalType": "address"
          }
        ],
        "anonymous": false
      },
      {
        "type": "event",
        "name": "AssetUnregistered",
        "inputs": [
          {
            "name": "sender",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "router",
            "type": "address",
            "indexed": false,
            "internalType": "address"
          },
          {
            "name": "asset",
            "type": "address",
            "indexed": false,
            "internalType": "address"
          }
        ],
        "anonymous": false
    }
] as const;