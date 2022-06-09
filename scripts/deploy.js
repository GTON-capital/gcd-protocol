const hre = require("hardhat");
const { ethers } = hre;

const vaultParamsRopsten = "0x634Cd07fce65a2f2930B55c7b1b20a97196d362F"
const vaultParamsEthereum = ""
const vaultParams = vaultParamsRopsten

const vaultRopsten = "0x097f64Be4E8De6608B1d28B3732aD480D8d45823"
const vaultEthereum = ""
const vault = vaultRopsten

const oracleRegistryRopsten = "0x85d7676ff4339C7e59eb7e90F160E909fc65d3bd"
const oracleRegistryEthereum = ""
const oracleRegistry = oracleRegistryRopsten

const chainlinkedOracleMainAssetRopsten = "0x406B838E5Ac09D90e7cB48187AD7f4075184eB28"
const chainlinkedOracleMainAssetEthereum = ""
const chainlinkedOracleMainAsset = chainlinkedOracleMainAssetRopsten

const wethRopsten = "0xc778417e063141139fce010982780140aa0cd5ab"
const wethEthereum = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const weth = wethRopsten

const gtonAddressRopsten = "0xaab9f76100e3332dc559878b0ebbf31cc4ab72e6"
const gtonAddressEthereum = "0x01e0e2e61f554ecaaec0cc933e739ad90f24a86d"
const gtonAddress = gtonAddressRopsten

const collateralRegistryRopsten = "0x5018c2a74015e09D9B72ac9571D2Ff5594355b63"
const collateralRegistryEthereum = ""
const collateralRegistry = collateralRegistryRopsten

const cdpRegistryRopsten = "0xD0011dE099E514c2094a510dd0109F91bf8791Fa"
const cdpRegistryEthereum = ""
const cdpRegistry = cdpRegistryRopsten

const vaultManagerParametersRopsten = "0x3c4925B50e337aeCC2cF4B9E4767B43DcfbaD286"
const vaultManagerParametersEthereum = ""
const vaultManagerParameters = vaultManagerParametersRopsten

const cdpManager01Ropsten = "0x7023401be71E1D8C8c9548933A2716aB3234E754"
const cdpManager01Ethereum = ""
const cdpManager01 = cdpManager01Ropsten

async function main() {
    await deployCDPManager01()
}

async function deployOracleRegistry() {
    const [deployer] = await ethers.getSigners()

    console.log("Deploying contracts with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = await Factory.deploy(
        vaultParams,
        weth
    )
    await contract.deployed()
    console.log("Deploy address: ", contract.address)

    await delay(20000)
    await hre.run("verify:verify", {
        address: contract.address,
        network: hre.network,
        constructorArguments: [
            vaultParams,
            weth
        ]
      });
}

async function deployCollateralRegistry() {
    const [deployer] = await ethers.getSigners()

    console.log("Deploying contracts with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("CollateralRegistry")
    const contract = await Factory.deploy(
        vaultParams,
        [gtonAddress]
    )
    await contract.deployed()
    console.log("Deploy address: ", contract.address)

    await delay(20000)
    await hre.run("verify:verify", {
        address: contract.address,
        network: hre.network,
        constructorArguments: [
            vaultParams,
            [gtonAddress]
        ]
      });
}

async function deployCDPRegistry() {
    const [deployer] = await ethers.getSigners()

    console.log("Deploying contracts with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("CDPRegistry")
    const contract = await Factory.deploy(
        vault,
        collateralRegistry
    )
    await contract.deployed()
    console.log("Deploy address: ", contract.address)

    await delay(20000)
    await hre.run("verify:verify", {
        address: contract.address,
        network: hre.network,
        constructorArguments: [
            vault,
            collateralRegistry
        ]
      });
}

async function deployVaultManagerParameters() {
    const [deployer] = await ethers.getSigners()

    console.log("Deploying contracts with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("VaultManagerParameters")
    const contract = await Factory.deploy(
        vaultParams
    )
    await contract.deployed()
    console.log("Deploy address: ", contract.address)

    await delay(20000)
    await hre.run("verify:verify", {
        address: contract.address,
        network: hre.network,
        constructorArguments: [
            vaultParams
        ]
      });
}

async function deployCDPManager01() {
    const [deployer] = await ethers.getSigners()

    console.log("Deploying contracts with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("CDPManager01")
    const contract = await Factory.deploy(
        vaultManagerParameters,
        oracleRegistry,
        cdpRegistry
    )
    await contract.deployed()
    console.log("Deploy address: ", contract.address)

    await delay(20000)
    await hre.run("verify:verify", {
        address: contract.address,
        network: hre.network,
        constructorArguments: [
            vaultManagerParameters,
            oracleRegistry,
            cdpRegistry
        ]
      });
}

async function setChainkinkedOracleWeth() {
    const [deployer] = await ethers.getSigners()

    console.log("Working with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = await Factory.attach(oracleRegistry)

    let setOracleTx = await contract.setOracle(1, chainlinkedOracleMainAsset)
    console.log("Set oracle tx: " + setOracleTx.hash)
    let setOracleTypeTx = await contract.setOracleTypeForAsset(weth, 1)
    console.log("Set oracle type for assettx: " + setOracleTypeTx.hash)
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
