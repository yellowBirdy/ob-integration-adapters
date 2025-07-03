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
    },
    // PRICE FEED EVENTS
    {
        "type": "event",
        "name": "TokenRegistered",
        "inputs": [
          {
            "name": "sender",
            "type": "address",
            "indexed": true,
            "internalType": "address"
          },
          {
            "name": "token",
            "type": "address",
            "indexed": false,
            "internalType": "address"
          },
          {
            "name": "priceFeedId",
            "type": "bytes32",
            "indexed": false,
            "internalType": "bytes32"
          },
          {
            "name": "assetName",
            "type": "string",
            "indexed": false,
            "internalType": "string"
          }
        ],
        "anonymous": false
    },
    // ORACLE EVENTS
    {
      "type": "event",
      "name": "PriceFeedUpdate",
      "inputs": [
        {
          "name": "id",
          "type": "bytes32",
          "indexed": false,
          "internalType": "bytes32"
        },
        {
          "name": "publishTime",
          "type": "uint64",
          "indexed": false,
          "internalType": "uint64"
        },
        {
          "name": "price",
          "type": "int64",
          "indexed": false,
          "internalType": "int64"
        },
        {
          "name": "conf",
          "type": "uint64",
          "indexed": false,
          "internalType": "uint64"
        }
      ],
      "anonymous": false
    },
] as const;