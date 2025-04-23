# Ooga Booga Integration Adapters

## Overview

This repo serves as a reference for the Ooga Booga team to integrate various DEXes. It involves the developers of the respective DEXes to create adapters to aid the process of integration into Ooga Booga's Smart Order Routing Algorithm.

The integration adapters will have 3 major roles:

1. State replication - Tracking of all DEX state off-chain that is necessary to simulate swaps. This is achieved by tracking relevant events emitted by the DEX's contracts.
2. Quote calculations - Implement off-chain quote logic based on the state being tracked.
3. Pool discovery - Being able to discover all pools available on the DEX, and track any new ones that are added through events.
4. Swap execution - Implement an example on how to execute a swap on a given DEX with a specified amountIn. This will be used as reference for integrating into the OBRouter where execution on-chain will happen.

Note that this is still a process that is being developed. We are actively working on improving the integration process and making it more developer-friendly.

The goal of these adapters is to help the Ooga Booga team speed up the integration process and allow us to churn out more integrations quickly. We are open to feedback on how we could improve this process for everyone.

If you need any help please reach out to the Ooga Booga Team.

## Getting Started

1. Have [bun](https://bun.sh/docs/installation) installed
2. Run `bun install`
3. Make a copy of `integrations/template` and rename it to `integrations/<dex_name>`. This will serve as a start point for the integration adapters.
4. Rename and implement the following files:
   - `TemplateBasePoolState.ts`: the interface for the pool state that needs to be tracked and updated by events emitted on-chain
   - `TemplatePoolMath.ts`: the math logic for the pool to generate quotes based on the state being tracked
   - `TemplatePoolProvider.ts`: the logic for discovering and tracking pools on the DEX. Also include the logic for executing swaps on the DEX.
   - `TemplatePoolMath.test.ts`: set of unit tests to run the pool math calculations to test the implementation.
    - Test can be run using `bun test <dex_name>` "dex_name" being the folder name
   - `runPoolProvider.ts`: helper to run the pool provider logic to test the implementation of the indexer
