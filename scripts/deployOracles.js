const hre = require("hardhat");
const { ethers } = hre;

class Config {

    constructor(p={}) {
        this.wethAddress = p.wethAddress;
        this.usdcAddress = p.field;
    }
}

const wethAddressRopsten = "0xc778417E063141139Fce010982780140Aa0cD5Ab"
const wethAddressEthereum = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const wethAddress = wethAddressRopsten

const usdcAddressRopsten = "0x46AfF14B22E4717934eDc2CB99bCB5Ea1185A5E8" // gtonUSDC
const usdcAddressEthereum = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
const usdcAddress = usdcAddressRopsten

const wethAggregatorUSDRopsten = "0xc6d5398e7174eb8f2F831C40E0711d5d613df27E"
const wethAggregatorUSDEthereum = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
const wethAggregatorUSD = wethAggregatorUSDRopsten // ETH / USD

const chainlinkedOracleMainAssetRopsten = "0x406B838E5Ac09D90e7cB48187AD7f4075184eB28"
const chainlinkedOracleMainAssetEthereum = ""
const chainlinkedOracleMainAsset = chainlinkedOracleMainAssetRopsten

const vaultParametersRopsten = "0x634cd07fce65a2f2930b55c7b1b20a97196d362f"
const vaultParametersEth = ""
const vaultParameters = vaultParametersRopsten

const gtonAddressRopsten = "0xaab9f76100e3332dc559878b0ebbf31cc4ab72e6"
const gtonAddressEthereum = "0x01e0e2e61f554ecaaec0cc933e739ad90f24a86d"
const gtonAddress = gtonAddressRopsten

const oracleRegistryRopsten = "0x85d7676ff4339C7e59eb7e90F160E909fc65d3bd"
const oracleRegistryEthereum = ""
const oracleRegistry = oracleRegistryRopsten

const uniV3OracleRopsten = "0xC8159047230668ffa0Fe7a026d2a5BC4D95bf981"
const uniV3OracleEthereum = ""
const uniV3Oracle = uniV3OracleRopsten

const chainlinkUSDCUSDAddressRopsten = "0x801bBB7A8C4B54BcC3f787da400694223dAe6731"
const chainlinkUSDCUSDAddressEthereum = ""
const chainlinkUSDCUSDAddress = chainlinkUSDCUSDAddressRopsten

var deployer;

async function main() {
    deployer = await getDeployer()

    await deployWETH()
}

async function getDeployer() {
    const [deployer] = await ethers.getSigners()   
    console.log("Account : ", deployer.address)
    console.log("Account balance: ", (await deployer.getBalance()).toString()) 
    return deployer
}

async function deployWETH() {
    const Factory = await ethers.getContractFactory("WETH9") // No arguments
    const contract = await Factory.deploy(
    )
    await contract.deployed()
    console.log("WETH Deploy address: ", contract.address)
}

async function deployGTON() {
    const Factory = await ethers.getContractFactory("GTON") // No arguments
    const contract = await Factory.deploy(
        "GTON",
        "GTON",
        "21000000000000000000000000",
        deployer.address
    )
    await contract.deployed()
    console.log("GTON Deploy address: ", contract.address)
}

async function deployUSDC() {
    const Factory = await ethers.getContractFactory("FiatTokenV2_1") // No arguments
    const contract = await Factory.deploy(
    )
    await contract.deployed()
    console.log("USDC Deploy address: ", contract.address)

    let initialize = await contract.initialize(
        "USDC",
        "USDC",
        "USD",
        6,
        deployer.address,
        deployer.address,
        deployer.address,
        deployer.address
    )
    await initialize.wait()
    console.log("Initialize tx hash: ", initialize.hash)

    let initializeV2 = await contract.initializeV2(
        "USDC"
    )
    await initializeV2.wait()
    console.log("InitializeV2 tx hash: ", initializeV2.hash)

    let initializeV2_1 = await contract.initializeV2_1(
        deployer.address
    )
    await initializeV2_1.wait()
    console.log("InitializeV2_1 tx hash: ", initializeV2_1.hash)

    let configureMinter = await contract.configureMinter(
        deployer.address,
        "99999999999000000"
    )
    await configureMinter.wait()
    console.log("ConfigureMinter tx hash: ", configureMinter.hash)

    let mintTx = await contract.mint(
        deployer.address,
        "1000000000000"
    )
    await mintTx.wait()
    console.log("Mint tx hash: ", mintTx.address)
}

async function deployMockAggregatorWethUSD() {
    const name = "ETH / USD"
    const price = 178954000000
    const decimals = 8

    const Factory = await ethers.getContractFactory("MockAggregator")
    const contract = await Factory.deploy(
        name,
        price,
        decimals
    )
    await contract.deployed()
    console.log("Deploy address: ", contract.address)

    await delay(20000)
    await hre.run("verify:verify", {
        address: contract.address,
        network: hre.network,
        constructorArguments: [
            name,
            price,
            decimals
        ]
      });
}

async function deployMockAggregatorUSDCUSD() {
    const name = "USDC / USD"
    const price = 100000000
    const decimals = 8

    const Factory = await ethers.getContractFactory("MockAggregator")
    const contract = await Factory.deploy(
        name,
        price,
        decimals
    )
    await contract.deployed()
    console.log("Deploy address: ", contract.address)

    await delay(20000)
    await hre.run("verify:verify", {
        address: contract.address,
        network: hre.network,
        constructorArguments: [
            name,
            price,
            decimals
        ]
      });
}

async function deployUniV3() {
    const Factory = await ethers.getContractFactory("UniswapV3OracleGCD") // No arguments
    const contract = await Factory.deploy(
    )
    await contract.deployed()
    console.log("Deploy address: ", contract.address)

    await delay(20000)
    await hre.run("verify:verify", {
        address: contract.address,
        network: hre.network,
        constructorArguments: [
        ]
      });
}

async function deployPoolAddressGetter() {
    const Factory = await ethers.getContractFactory("UniV3PoolAddress") // No arguments
    const contract = await Factory.deploy(
    )
    await contract.deployed()
    console.log("Deploy address: ", contract.address)

    await delay(20000)
    await hre.run("verify:verify", {
        address: contract.address,
        network: hre.network,
        constructorArguments: [
        ]
      });
}

async function setGtonQuoteParamsWeth() {
    const Factory = await ethers.getContractFactory("UniswapV3OracleGCD") // No arguments
    const contract = Factory.attach(uniV3Oracle)

    let quoteParams = [
        "0x0000000000000000000000000000000000000000", // Quote token, if "0x0000000000000000000000000000000000000000" - oracle sets default (weth)
        0, // Pool fee, default - 0.3 percent, 3000, if 0 - oracle sets default
        0 // TWAP period, default - 30 mins, if 0 - oracle sets default
    ]
    let tx = await contract.setQuoteParams(gtonAddress, quoteParams)
    await tx.wait()
    console.log("Set GTON quote params WETH tx: " + tx.hash)
}

async function setGtonQuoteParamsUSDC() {
    const Factory = await ethers.getContractFactory("UniswapV3OracleGCD") // No arguments
    const contract = Factory.attach(uniV3Oracle)

    let quoteParams = [
        usdcAddress, // Quote token, if "0x0000000000000000000000000000000000000000" - oracle sets default (weth)
        0, // Pool fee, default - 0.3 percent, 3000, if 0 - oracle sets default
        0 // TWAP period, default - 30 mins, if 0 - oracle sets default
    ]
    let tx = await contract.setQuoteParams(gtonAddress, quoteParams)
    console.log("Set GTON quote params USDC tx: " + tx.hash)
    await tx.wait()
    console.log("Quote params set")
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
