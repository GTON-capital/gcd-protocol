# GCD Protocol Contracts

### Ecosystem

| Name          | Mainnet | Görli Testnet |
| ------------- |:-------------:|:-------------:|
| [Wrapped network token (WETH, WBNB, ...)](contracts/test-helpers/WETH.sol)      | [0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2](https://etherscan.io/address/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2#code) | [0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6](https://goerli.etherscan.io/address/0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6#code) |
| [Uniswap Factory](https://github.com/Uniswap/uniswap-v2-core/blob/master/contracts/UniswapV2Factory.sol)      | [0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f](https://etherscan.io/address/0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f#code)      |
| [SushiSwap](https://github.com/sushiswap/sushiswap/blob/master/contracts/uniswapv2/UniswapV2Factory.sol) ([PancakeV2](https://github.com/pancakeswap/pancake-swap-core/blob/master/contracts/PancakeFactory.sol)) Factory | [0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac](https://etherscan.io/address/0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac#code)      |
| Network token / USD Chainlink Aggregator | [0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419](https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419#code) ([frontend](https://data.chain.link/ethereum/mainnet/crypto-usd/eth-usd)) |


### Core

| Name          | Mainnet | Görli Testnet |
| ------------- |:-------------:|:-------------:|
| Vault |
| GCD |
| VaultParameters      |
| VaultManagerParameters      |
| VaultManagerBorrowFeeParameters      |
| LiquidationAuction02      |
| CDPManager01      |

### Helpers & Registries

| Name          | Mainnet | Görli Testnet |
| ------------- |:-------------:|:-------------:|
| OracleRegistry |
| ParametersBatchUpdater |
| AssetParametersViewer |
| CDPViewer |
| CollateralRegistry      |
| CDPRegistry      |
| SwappersRegistry |
| ForceTransferAssetStore      |
| AssetsBooleanParameters |

### Swappers

| Name          | Mainnet | Görli Testnet |
| ------------- |:-------------:|:-------------:|
| SwapperWethViaCurve | - | - | - | - |
| SwapperUniswapV2Lp | - | - | - | - |

### Oracles

| Name          | Type (alias) | Mainnet | Görli Testnet |
| ------------- |:-------------:|:-------------:|:-------------:|
| ChainlinkedOracleMainAsset | 5 (3, 7) | [0x54b21C140F5463e1fDa69B934da619eAaa61f1CA](https://etherscan.io/address/0x54b21C140F5463e1fDa69B934da619eAaa61f1CA#code)      | [0x8F904b4d41630135fa020E8cE5Dd6DFD92028264](https://bscscan.com/address/0x8F904b4d41630135fa020E8cE5Dd6DFD92028264) | [0xEac49454A156AbFF249E2C1A2aEF4E4f192D8Cb9](https://ftmscan.com/address/0xEac49454A156AbFF249E2C1A2aEF4E4f192D8Cb9) | [0x850943c274f5d2bAB9e643AfF7b1c1eEB89d30DD](https://blockscout.com/xdai/mainnet/address/0x850943c274f5d2bAB9e643AfF7b1c1eEB89d30DD) |
| [UniswapV3Oracle](https://github.com/unitprotocol/uniswap-v3-oracle)      | 16 | [0xd31817a1E1578C4BECE02FbFb235d76f5716f18f](https://etherscan.io/address/0xd31817a1E1578C4BECE02FbFb235d76f5716f18f#code)  | - | - | - |
