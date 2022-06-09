const hre = require("hardhat");
const { ethers } = hre;

const vaultParamsRopsten = "0x634Cd07fce65a2f2930B55c7b1b20a97196d362F"
const vaultParamsEthereum = ""
const vaultParams = vaultParamsRopsten

const oracleRegistryRopsten = "0x85d7676ff4339C7e59eb7e90F160E909fc65d3bd"
const oracleRegistryEthereum = ""
const oracleRegistry = oracleRegistryRopsten

const chainlinkedOracleMainAssetRopsten = "0x406B838E5Ac09D90e7cB48187AD7f4075184eB28"
const chainlinkedOracleMainAssetEthereum = ""
const chainlinkedOracleMainAsset = chainlinkedOracleMainAssetRopsten

const wethRopsten = "0xc778417e063141139fce010982780140aa0cd5ab"
const wethEthereum = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const weth = wethRopsten

async function main() {
    await setChainkinkedOracleWeth()
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
