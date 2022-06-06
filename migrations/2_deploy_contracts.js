const Vault = artifacts.require('Vault');
const Parameters = artifacts.require('VaultParameters');
const USDP = artifacts.require('USDP');
const WETH = artifacts.require('WETH');
const DummyToken = artifacts.require('DummyToken');
const IUniswapV2Factory = artifacts.require('IUniswapV2Factory');
const UniswapV2Router02 = artifacts.require('UniswapV2Router02');
// const VaultManagerUniswap = artifacts.require('VaultManagerKeydonixMainAsset');
const { constants : { ZERO_ADDRESS }, ether } = require('openzeppelin-test-helpers');
const { calculateAddressAtNonce, deployContractBytecode } = require('../test/helpers/deployUtils');
const UniswapV2FactoryDeployCode = require('../test/helpers/UniswapV2DeployCode');
const BN = web3.utils.BN;

const gtonAddressRopsten = "0xaab9f76100e3332dc559878b0ebbf31cc4ab72e6"
const daiRopsten = "0xa20b90104dd80cdda195dd42b691e924ae89c1c1"
const usdcRopsten = "0x46aff14b22e4717934edc2cb99bcb5ea1185a5e8"
const wethRopsten = "0xc778417e063141139fce010982780140aa0cd5ab"
const uniswapOracleRopsten = ""

const gtonAddress = gtonAddressRopsten
const daiAddress = daiRopsten
const usdcAddress = usdcRopsten
const wethAddress = wethRopsten
const uniswapOracleAddress = uniswapOracleRopsten

const getUtils = context => {
  return {
    poolDeposit: async (token, amount, decimals) => {
      amount = decimals ? new BN(String(amount * 10 ** decimals)) : ether(amount.toString());
      amount = amount.div(new BN((10 ** 6).toString()));

      const block = await web3.eth.getBlock('latest');
      const time = new BN(block.timestamp);

      await token.approve(context.uniswapRouter.address, amount);
      await context.uniswapRouter.addLiquidity(
        token.address,
        context.weth.address,
        amount,
        ether('1').div(new BN((10 ** 6).toString())),
        amount,
        ether('1').div(new BN((10 ** 6).toString())),
        context.deployer,
        time.add(new BN('10000')),
      );
    },
  }
};

module.exports = async function(deployer, network) {
  // const utils = getUtils(this);
  //
  // // if (network !== 'ropsten-fork') {
  // //   console.log(`Contracts will not be deployed on this network: ${network}`);
  // //   return;
  // // }
  //
  await deployer;
  
  this.deployer = deployer.networks[network].from;
  
  const col = await DummyToken.at(gtonAddress); // Main collateral token
  // const dai = await DummyToken.at(daiAddress);
  // const usdc = await DummyToken.at(usdcAddress);
  this.weth = await WETH.at(wethAddress);
  // const mainCollateral = await deployer.deploy(DummyToken, "STAKE", "STAKE", 18, ether('1000000'));
  
  // await this.weth.deposit({ value: ether('1') });
  //
  // const uniswapFactoryAddr = await deployContractBytecode(UniswapV2FactoryDeployCode, this.deployer, web3);
  // const uniswapFactory = await IUniswapV2Factory.at(uniswapFactoryAddr);
  // // const uniswapFactory = await IUniswapV2Factory.at('0xbcFBC1DF1e886B8835098EFD8971fDf89F9aeFF1');
  // await uniswapFactory.createPair(dai.address, this.weth.address);
  // await uniswapFactory.createPair(usdc.address, this.weth.address);
  //
  // const uniswapOracle = await deployer.deploy(UniswapOracle,
  //   uniswapFactory.address,
  //   dai.address,
  //   usdc.address,
  //   this.weth.address,
  // );
  //

  // const uniswapOracle = await UniswapOracle.at("uniswapOracleAddress");

  const parametersAddr = calculateAddressAtNonce(this.deployer, await web3.eth.getTransactionCount(this.deployer) + 1, web3);
  const usdp = await deployer.deploy(USDP, parametersAddr);
  const vaultAddr = calculateAddressAtNonce(this.deployer, await web3.eth.getTransactionCount(this.deployer) + 1, web3);
  const parameters = await deployer.deploy(Parameters, vaultAddr, this.deployer);
  const vault = await deployer.deploy(Vault, parameters.address, col.address, usdp.address, wethAddress);
  // const liquidator = await deployer.deploy(Liquidator, vault.address, uniswapOracle.address, this.deployer);
  // const vaultManager = await deployer.deploy(
  //   VaultManagerUniswap,
  //   vault.address,
  //   parameters.address,
  //   uniswapOracle.address,
  // );
  //
  // this.uniswapRouter = await deployer.deploy(UniswapV2Router02, uniswapFactoryAddr, ZERO_ADDRESS);
  // // this.uniswapRouter = await UniswapV2Router02.at('0x5695C483B22bd5018416B5A5118236306d438C85');
  //
  // await this.weth.approve(this.uniswapRouter.address, ether('100'));
  //
  // // Add liquidity to DAI/WETH pool; rate = 200 DAI/ETH
  // await utils.poolDeposit(dai, 200);
  //
  // // Add liquidity to USDC/WETH pool
  // await utils.poolDeposit(usdc, 300, 6);
  //
  // // Add liquidity to COL/WETH pool; rate = 250 COL/WETH; 1 COL = 1 USD
  // await utils.poolDeposit(col, 250);
  //
  // // Add liquidity to some token/WETH pool; rate = 125 token/WETH; 1 token = 2 USD
  // await utils.poolDeposit(mainCollateral, 125);
  //
  // await parameters.setOracleType('0', mainCollateral.address, true);
  // await parameters.setVaultAccess(vaultManager.address, true);
  // await parameters.setCollateral(
  //   mainCollateral.address,
  //   '0', // stability fee
  //   '0', // liquidation fee
  //   '67', // initial collateralization
  //   '68', // liquidation ratio
  //   ether('100000'), // debt limit
  //   [0], // enabled oracles
  //   3,
  //   5,
  // );
};
