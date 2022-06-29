# GCD Protocol

[GCD Protocol](https://gton.capital/) is a decentralized protocol that allows you to mint stablecoin [GCD](contracts/GCD.sol) using a variety of tokens as collateral. Based on [Unit Protocol](https://docs.unit.xyz/).

# Development

Contains git submodule [Oracles](https://github.com/GTON-capital/gcd-oracles). To initialize:

```shell
git submodule init
git submodule update
```
# Contracts

#### [Contract addresses](CONTRACTS.md)

## Oracles

#### [Oracle contracts](CONTRACTS.md#Oracles)

The most important part of the onchain stablecoin protocol is the oracles that allow the system to measure asset values on the fly. GCD Protocol stablecoin system currently uses the following types of onchain oracles:

- Direct wrappers for existing [Chainlink feeds](https://data.chain.link/)
- Custom wrappers for DeFi primitives (aka bearing assets) using Chainlink-based wrappers

See the full current list of contracts here: [Oracle contracts](CONTRACTS.md#Oracles).
