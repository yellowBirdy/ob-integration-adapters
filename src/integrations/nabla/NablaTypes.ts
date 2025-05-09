export type PriceFeedUpdate = {
  binary: {
    data: `0x${string}`[],
    encoding: string,
  },
      
  parsed:{
    id: string,
    metadata: {},
    price: {
      price: bigint,
      publish_time: bigint,
    },
  }[],
};

export type AssetPrice = {
  price: bigint;
  publish_time: bigint;
};