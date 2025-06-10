export const OracleAbi = 
[
  {
    "type": "function",
    "name": "getAssetPrice",
    "inputs": [
      {
        "name": "_asset",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "assetPrice_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAssetPrice",
    "inputs": [
      {
        "name": "_asset",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUpdateFee",
    "inputs": [
      {
        "name": "_updateData",
        "type": "bytes[]",
        "internalType": "bytes[]"
      }
    ],
    "outputs": [
      {
        "name": "updateFee_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isPriceFeedRegistered",
    "inputs": [
      {
        "name": "_asset",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "isRegistered_",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "registerPriceFeed",
    "inputs": [
      {
        "name": "_asset",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_priceFeedId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "success_",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unregisterPriceFeed",
    "inputs": [
      {
        "name": "_asset",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "success_",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updatePriceFeeds",
    "inputs": [
      {
        "name": "_priceUpdateData",
        "type": "bytes[]",
        "internalType": "bytes[]"
      }
    ],
    "outputs": [
      {
        "name": "success_",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "payable"
  },
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
        "name": "assetName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "priceFeedId",
        "type": "bytes32",
        "indexed": false,
        "internalType": "bytes32"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "BackstopPoolRemoved",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "backstopPool",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "BackstopPoolSet",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "backstopPool",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PriceFeedUpdate",
    "inputs": [
      {
        "name": "id",
        "type": "bytes32",
        "indexed": true,
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
  {
    "type": "event",
    "name": "PriceFeedsUpdated",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "updateFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PriceMaxAgeSet",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "nablaContract",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newPriceMaxAge",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SignerSet",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newSigner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "oldSigner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
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
  {
    "type": "error",
    "name": "DPO__constructor_ZERO_ADDRESS",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__extractMessageAndSignature_TOO_SHORT",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__getAssetPrice_INVALID_ASSET",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__getAssetPrice_STALE_PRICE",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__isPriceFeedRegistered_EMPTY_ID",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__isPriceFeedRegistered_NO_ASSET",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__isPriceFeedRegistered_ZERO_ADDRESS",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__registerPriceFeed_ALREADY_REGISTERED",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__registerPriceFeed_EMPTY_NAME",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__registerPriceFeed_EMPTY_PRICE_FEED_ID",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__registerToken_ALREADY_REGISTERED",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__registerToken_EMPTY_NAME",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__registerToken_NO_ASSET",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__registerToken_ZERO_ADDRESS",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__removeBackstopPool_NOT_SET",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__removeBackstopPool_ZERO_ADDRESS",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__setBackstopPool_ALREADY_SET",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__setBackstopPool_ZERO_ADDRESS",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__setPriceMaxAge_INVALID_MAX_AGE",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__setPriceMaxAge_ZERO_ADDRESS",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__setSigner_ZERO_ADDRESS",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__unregisterToken_NOT_REGISTERED",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__unregisterToken_ZERO_ADDRESS",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__updatePriceFeeds_INVALID_ASSET",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__updatePriceFeeds_INVALID_PRICE",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__updatePriceFeeds_INVALID_SIGNATURE",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__updatePriceFeeds_INVALID_TIMESTAMP",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__updatePriceFeeds_NO_UPDATE_DATA",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DPO__validateMessage_INVALID_SIGNATURE",
    "inputs": []
  }
]