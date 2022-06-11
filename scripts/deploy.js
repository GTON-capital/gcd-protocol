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

const chainkinkedOracleIndex = 1
const chainlinkedOracleMainAssetRopsten = "0x406B838E5Ac09D90e7cB48187AD7f4075184eB28"
const chainlinkedOracleMainAssetEthereum = ""
const chainlinkedOracleMainAsset = chainlinkedOracleMainAssetRopsten

const uniV3OracleIndex = 2
const uniV3OracleRopsten = "0xC8159047230668ffa0Fe7a026d2a5BC4D95bf981"
const uniV3OracleEthereum = ""
const uniV3Oracle = uniV3OracleRopsten

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
    await borrowGCDForEth()
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

async function setVaultManagerParametersAsManagerOfVaultParams() {
    const [deployer] = await ethers.getSigners()

    console.log("Deploying contracts with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("VaultParameters")
    const contract = Factory.attach(vaultParams)
    
    let tx = await contract.setManager(vaultManagerParameters, true)
    tx.wait()
    console.log("Set VMP as VaultParams manager tx: " + tx.hash)
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

async function setCDPManagerVaultAccess() {
    const [deployer] = await ethers.getSigners()

    console.log("Deploying contracts with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("VaultParameters")
    const contract = Factory.attach(vaultParams)

    let tx = await contract.setVaultAccess(cdpManager01, true);
    tx.wait()
    console.log("CDPManager01 as vault access entity tx: " + tx.hash)
}

async function addChainkinkedOracle() {
    const [deployer] = await ethers.getSigners()

    console.log("Working with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = await Factory.attach(oracleRegistry)

    let tx = await contract.setOracle(chainkinkedOracleIndex, chainlinkedOracleMainAsset)
    tx.wait()
    console.log("Set chainlinked oracle tx: " + tx.hash)
}

async function setChainkinkedOracleWeth() {
    const [deployer] = await ethers.getSigners()

    console.log("Working with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = await Factory.attach(oracleRegistry)

    let tx = await contract.setOracleTypeForAsset(weth, chainkinkedOracleIndex)
    tx.wait()
    console.log("Set oracle type for asset tx: " + tx.hash)
}

async function enableOracleTypeForWethOnVaultParams() {
    const [deployer] = await ethers.getSigners()

    console.log("Working with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("VaultParameters")
    const contract = Factory.attach(vaultParams)

    let tx = await contract.setOracleType(chainkinkedOracleIndex, weth, true)
    tx.wait()
    console.log("Set chainlinked oracle tx: " + tx.hash)
}

async function addUniV3Oracle() {
    const [deployer] = await ethers.getSigners()

    console.log("Working with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = await Factory.attach(oracleRegistry)

    let tx = await contract.setOracle(uniV3OracleIndex, uniV3Oracle)
    tx.wait()
    console.log("Set oracle tx: " + tx.hash)
}

async function setUniV3OracleGton() {
    const [deployer] = await ethers.getSigners()

    console.log("Working with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = await Factory.attach(oracleRegistry)

    let tx = await contract.setOracleTypeForAsset(gtonAddress, uniV3OracleIndex)
    tx.wait()
    console.log("Set oracle type for asset tx: " + tx.hash)
}

async function enableOracleTypeForGtonOnVaultParams() {
    const [deployer] = await ethers.getSigners()

    console.log("Working with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("VaultParameters")
    const contract = Factory.attach(vaultParams)

    let tx = await contract.setOracleType(uniV3OracleIndex, gtonAddress, true)
    tx.wait()
    console.log("Set chainlinked oracle tx: " + tx.hash)
}

/**
     * @notice Only manager is able to call this function
     * @dev Sets ability to use token as the main collateral
     * @param asset The address of the main collateral token
     * @param stabilityFeeValue The percentage of the year stability fee (3 decimals)
     * @param liquidationFeeValue The liquidation fee percentage (0 decimals)
     * @param initialCollateralRatioValue The initial collateralization ratio
     * @param liquidationRatioValue The liquidation ratio
     * @param liquidationDiscountValue The liquidation discount (3 decimals)
     * @param devaluationPeriodValue The devaluation period in blocks
     * @param gcdLimit The GCD token issue limit
     * @param oracles The enabled oracles type IDs
     * @param minColP The min percentage of COL value in position (0 decimals)
     * @param maxColP The max percentage of COL value in position (0 decimals)
     **/

 async function setWethCollateralOnManagerParameters() {
    const [deployer] = await ethers.getSigners()

    console.log("Deploying contracts with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("VaultManagerParameters")
    const contract = Factory.attach(vaultManagerParameters)
    
    // Same parameters as in Unit protocol:
    // https://etherscan.io/tx/0xd92d938932af61bcd2e837436f8c53f35fab2709d2029693258bb8578bdb8a29
    let tx = await contract.setCollateral(
        weth, // assets
        1900, // stabilityFeeValue,
        10, // liquidationFeeValue,
        50, // initialCollateralRatioValue,
        70, // liquidationRatioValue,
        0, // liquidationDiscountValue,
        3300, // devaluationPeriodValue,
        "100000000000000000000000", // gcdLimit,
        [chainkinkedOracleIndex], // [] oracles,
        3, // minColP,
        10, // maxColP
    );
    tx.wait()
    console.log("Set GTON as collateral tx: " + tx.hash)
 }

async function setGtonCollateralOnManagerParameters() {
    const [deployer] = await ethers.getSigners()

    console.log("Deploying contracts with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("VaultManagerParameters")
    const contract = Factory.attach(vaultManagerParameters)
    
    let tx = await contract.setCollateral(
        gtonAddress, // asset
        2300, // stabilityFeeValue,
        15, // liquidationFeeValue,
        30, // initialCollateralRatioValue,
        60, // liquidationRatioValue,
        0, // liquidationDiscountValue,
        3300, // devaluationPeriodValue,
        "100000000000000000000000", // gcdLimit,
        [uniV3OracleIndex], // [] oracles,
        3, // minColP,
        10, // maxColP
    );
    tx.wait()
    console.log("Set GTON as collateral tx: " + tx.hash)
}

async function borrowGCDForGTON() {
    const [deployer] = await ethers.getSigners()

    console.log("Deploying contracts with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("CDPManager01")
    const contract = Factory.attach(cdpManager01)
    
    let tx = await contract.join(
        gtonAddress, // asset
        "0", // collateralValue,
        "1000000000000000000" // GCD value
    );
    tx.wait()
    console.log("Borrow tx: " + tx.hash)
}
async function borrowGCDForEth() {
    const [deployer] = await ethers.getSigners()

    console.log("Deploying contracts with the account:", deployer.address)
    console.log("Account balance:", (await deployer.getBalance()).toString())

    const Factory = await ethers.getContractFactory("CDPManager01")
    const contract = Factory.attach(cdpManager01)
    
    const options = {value: ethers.utils.parseEther("0.01")} // Eth collateral
    let tx = await contract.join_Eth(
        "1", // GCD value,
        options
    );
    tx.wait()
    console.log("Borrow tx: " + tx.hash)
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
