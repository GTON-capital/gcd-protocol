const hre = require("hardhat");
const { upgrades } = require("hardhat");
const { ethers } = hre;
const {
    configEthereum,
    configBsc,
    configMumbai,
    upgradableConfigRopsten,
    configBscTestnet,
} = require("./config.js");

const { calculateAddressAtNonce } = require('../test/gcd/helpers/deployUtils.js');

var config = configBsc

var deployer;
var verifyOnDeploy = true

async function main() {
    deployer = await getDeployer()

    // await deployBaseOfCore()
    // await deployAndSetupRestOfTheCore()
    // await deployAndSetupOracles()
    // if (!verifyOnDeploy) {
    //     await verifyContracts()
    // }
}

async function addStablecoinCollateral(tokenAddress) {
    await setChainkinkedOracle(tokenAddress)
    await enableChainlinkedOracleTypeOnVaultParams(tokenAddress)
    await setStablecoinCollateralOnManagerParameters(tokenAddress)
}

async function getDeployer() {
    const [deployer] = await ethers.getSigners()   
    console.log("Account : ", deployer.address)
    console.log("Account balance: ", (await deployer.getBalance()).toString()) 
    return deployer
}

async function deployAndSetupRestOfTheCore() {
    // Deployments
    await deployOracleRegistry()
    await deployCollateralRegistry()
    await deployCDPRegistry()
    await deployVaultManagerParameters()
    await deployCDPManager01()
    // Setup
    await setVaultManagerParametersAsManagerOfVaultParams()
    await setCDPManagerVaultAccess()
}

async function deployAndSetupOraclesBSC() {
    if (config.chainlinkBNBUSDAddress == "" || 
        config.chainlinkBUSDUSDAddress == "" ||
        config.chainlinkUSDCUSDAddress == "") { 
            console.log("Need chainlink oracles"); return 
        }
    // Deploy base proxies
    await deployChainlinkedOracleMainAsset()
    await deployUniV3Oracle()
    // Setup of oracles
    await addChainkinkedOracleToRegistry()
    await addUniV3OracleToRegistry()
    // Setting collateral
    // WETH
    await setChainkinkedOracleWeth()
    await enableOracleTypeForWethOnVaultParams()
    await setWethCollateralOnManagerParameters()
    // USDC
    await addStablecoinCollateral(config.usdcAddress)
    // BUSD
    await addStablecoinCollateral(config.busdAddress)
}

async function deployAndSetupOraclesETH() {
    if (config.chainlinkUSDCUSDAddress == "" || 
        config.chainlinkETHUSDAddress == "") { 
            console.log("Need chainlink oracles"); return 
        }
    // Deploy base proxies
    await deployChainlinkedOracleMainAsset()
    await deployUniV3Oracle()
    // Setup of oracles
    await addChainkinkedOracleToRegistry()
    await addUniV3OracleToRegistry()
    await setChainkinkedOracleWeth()
    await setChainkinkedOracleUSDC()
    // await setUniV3OracleOGXT() // ethereum
    await setChainkinkedOracleOGXT() // bsc testnet
    // Setting collateral2
    // WETH
    await enableOracleTypeForWethOnVaultParams()
    await setWethCollateralOnManagerParameters()
    // USDC - not collateral, just need oracle here for OGXT
    await enableOracleTypeForUSDCOnVaultParams()
    // OGXT
    await enableOracleTypeForOGXTOnVaultParams()
    await setOGXTCollateralOnManagerParameters()
    await setOGXTQuoteParamsUSDC()
}

async function deploy(factoryName, args) {
    const Factory = await ethers.getContractFactory(factoryName)
    const contract = await Factory.deploy(...args)
    await contract.deployed()
    console.log(factoryName + " address: ", contract.address)

    if (verifyOnDeploy) {
    await delay(30000)
    try {
        await hre.run("verify:verify", {
            address: contract.address,
            network: hre.network,
            constructorArguments: args
        });
    } catch (error) {
        console.error(error);
        return contract
    }
    }
    return contract
}

async function deployUpgradable(factoryName, args) {
    const Factory = await ethers.getContractFactory(factoryName)
    const proxy = await upgrades.deployProxy(Factory, args, { 
        initializer: 'initialize', 
        kind: 'uups' 
    });
    await proxy.deployed()
    console.log(factoryName + " proxy address: ", proxy.address)

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxy.address)
    console.log(factoryName + " implementation address: ", implementationAddress)

    if (verifyOnDeploy) {
    await delay(30000)
    try {
        await hre.run("verify:verify", {
            address: implementationAddress,
            network: hre.network
        });
    } catch (error) {
        console.error(error);
        return proxy
    }
    }
    return proxy
}

async function upgradeContract(address, factoryName, args) {
    const Factory = await ethers.getContractFactory(factoryName)
    const proxy = await upgrades.upgradeProxy(address, Factory, args, { 
        initializer: 'initialize', 
        kind: 'uups' 
    });
    await proxy.deployed()
    console.log(factoryName + " proxy address: ", proxy.address)

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxy.address)
    console.log(factoryName + " implementation address: ", implementationAddress)

    if (verifyOnDeploy) {
    await delay(30000)
    try {
        await hre.run("verify:verify", {
            address: implementationAddress,
            network: hre.network
        });
    } catch (error) {
        console.error(error);
        return proxy
    }
    }
    return proxy
}


async function deployBaseOfCore() {
    // GCD
    const parametersAddr = calculateAddressAtNonce(deployer.address, await web3.eth.getTransactionCount(deployer.address) + 3, web3)
    console.log("Expected params: " + parametersAddr)
    const gcd = await deployUpgradable("GCD", [parametersAddr])
    config.gcd = gcd.address

    // Parameters
    const vaultAddr = calculateAddressAtNonce(deployer.address, await web3.eth.getTransactionCount(deployer.address) + 3, web3)
    console.log("Expected vault: " + vaultAddr)
    const parameters = await deployUpgradable("VaultParameters", [
        vaultAddr,
        config.feesCollector // Multisig
    ])
    config.vaultParams = parameters.address

    // Vault
    const vault = await deployUpgradable("Vault", [
        config.vaultParams,
        config.gcd,
        config.wethAddress
    ])
    config.vault = vault.address
}

async function upgradeGCD() {
    const gcd = await upgradeContract(config.gcd, "GCD", [config.vaultParams])
}

async function upgradeVaultParameters() {
    const parameters = await upgradeContract(config.vaultParams, "VaultParameters", [
        config.vault,
        config.feesCollector // Multisig
    ])
}

async function upgradeVault() {
    const vault = await upgradeContract(config.vault, "Vault", [
        config.vaultParams,
        config.gcd,
        config.wethAddress
    ])
}

let OracleRegistryConstructor = [
    config.vaultParams,
    config.wethAddress
]

async function deployOracleRegistry() {
    console.log("deployOracleRegistry")
    if (config.oracleRegistry != "") { console.log("Already deployed"); return }
    const contract = await deploy("OracleRegistry", OracleRegistryConstructor)
    config.oracleRegistry = contract.address
}

let CollateralRegistryConstructor = [
    config.vaultParams,
    []
]

async function deployCollateralRegistry() {
    console.log("deployCollateralRegistry")
    if (config.collateralRegistry != "") { console.log("Already deployed"); return }
    const contract = await deploy("CollateralRegistry", CollateralRegistryConstructor)
    config.collateralRegistry = contract.address
}

let CDPRegistryConstructor = [
    config.vault,
    config.collateralRegistry
]

async function deployCDPRegistry() {
    console.log("deployCDPRegistry")
    if (config.cdpRegistry != "") { console.log("Already deployed"); return }
    const contract = await deploy("CDPRegistry", CDPRegistryConstructor)
    config.cdpRegistry = contract.address
}

let VaultManagerParametersConstructor = [
    config.vaultParams
]

async function deployVaultManagerParameters() {
    console.log("deployVaultManagerParameters")
    if (config.vaultManagerParameters != "") { console.log("Already deployed"); return }
    const contract = await deploy("VaultManagerParameters", VaultManagerParametersConstructor)
    config.vaultManagerParameters = contract.address
}

let CDPManager01Constructor = [
    config.vaultManagerParameters,
    config.oracleRegistry,
    config.cdpRegistry
]

async function deployCDPManager01() {
    console.log("deployCDPManager01")
    if (config.cdpManager01 != "") { console.log("Already deployed"); return }
    const contract = await deploy("CDPManager01", CDPManager01Constructor)
    config.cdpManager01 = contract.address
}

async function setVaultManagerParametersAsManagerOfVaultParams() {
    // Add check
    console.log("setVaultManagerParametersAsManagerOfVaultParams")
    const Factory = await ethers.getContractFactory("VaultParameters")
    const contract = Factory.attach(config.vaultParams)
    
    let tx = await contract.setManager(config.vaultManagerParameters, true)
    await tx.wait()
    console.log("Set VMP as VaultParams manager tx: " + tx.hash)
}

async function setCDPManagerVaultAccess() {
    // Add check
    console.log("setCDPManagerVaultAccess")
    const Factory = await ethers.getContractFactory("VaultParameters")
    const contract = Factory.attach(config.vaultParams)

    let tx = await contract.setVaultAccess(config.cdpManager01, true);
    await tx.wait()
    console.log("CDPManager01 as vault access entity tx: " + tx.hash)
}

// Oracles
let ChainlinkedOracleMainAssetConstructor = [
    [
        config.wethAddress,
        config.usdcAddress,
        config.busdAddress,
    ], // tokenAddresses1 - usd
    [
        config.chainlinkBNBUSDAddress,
        config.chainlinkUSDCUSDAddress,
        config.chainlinkBUSDUSDAddress,
    ], // _usdAggregators
    [], // tokenAddresses2 - eth
    [], // _ethAggregators
    config.wethAddress, // weth
    config.vaultParams, // VaultParameters
]

async function deployChainlinkedOracleMainAsset() {
    console.log("deployChainlinkedOracleMainAsset")
    if (config.chainlinkedOracleMainAsset != "") { console.log("Already deployed"); return }
    const contract = await deploy("ChainlinkedOracleMainAsset", ChainlinkedOracleMainAssetConstructor)
    config.chainlinkedOracleMainAsset = contract.address
}

async function addChainkinkedOracleToRegistry() {
    console.log("addChainkinkedOracleToRegistry")
    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = Factory.attach(config.oracleRegistry)

    let tx = await contract.setOracle(config.chainkinkedOracleIndex, config.chainlinkedOracleMainAsset)
    await tx.wait()
    console.log("Set chainlinked oracle tx: " + tx.hash)
}

let UniswapV3OracleGCDConstructor = [
]

async function deployUniV3Oracle() {
    console.log("deployUniV3Oracle")
    // throw "Don't forget to set VaultParameters & defaultQuoteAsset in contract code"
    if (config.uniV3Oracle != "") { console.log("Already deployed"); return }
    const contract = await deploy("UniswapV3OracleGCD", UniswapV3OracleGCDConstructor)
    config.uniV3Oracle = contract.address
}

async function addUniV3OracleToRegistry() {
    console.log("addUniV3OracleToRegistry")
    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = Factory.attach(config.oracleRegistry)

    let tx = await contract.setOracle(config.uniV3OracleIndex, config.uniV3Oracle)
    await tx.wait()
    console.log("Set oracle tx: " + tx.hash)
}

async function setChainkinkedOracleWeth() {
    console.log("setChainkinkedOracleWeth")
    await setChainkinkedOracle(config.wethAddress)
}

async function setChainkinkedOracleUSDC() {
    console.log("setChainkinkedOracleUSDC")
    await setChainkinkedOracle(config.usdcAddress)
}

async function setChainkinkedOracleBUSD() {
    console.log("setChainkinkedOracleUSDC")
    await setChainkinkedOracle(config.usdcAddress)
}

async function setChainkinkedOracleOGXT() {
    console.log("setChainkinkedOracleOGXT")
    await setChainkinkedOracle(config.ogxtAddress)
}

async function setChainkinkedOracle(tokenAddress) {
    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = Factory.attach(config.oracleRegistry)

    let tx = await contract.setOracleTypeForAsset(tokenAddress, config.chainkinkedOracleIndex)
    await tx.wait()
    console.log("Set oracle type for token tx: " + tx.hash)
}

async function setUniV3OracleOGXT() {
    console.log("setUniV3OracleOGXT")
    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = Factory.attach(config.oracleRegistry)

    let tx = await contract.setOracleTypeForAsset(config.ogxtAddress, config.uniV3OracleIndex)
    await tx.wait()
    console.log("Set oracle type for OGXT tx: " + tx.hash)
}

// Setting collaterals & minting scripts

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
     **/

 async function setWethCollateralOnManagerParameters() {
    console.log("setWethCollateralOnManagerParameters")
    const Factory = await ethers.getContractFactory("VaultManagerParameters")
    const contract = Factory.attach(config.vaultManagerParameters)
    
    // Same parameters as in Unit protocol:
    // https://etherscan.io/tx/0xd92d938932af61bcd2e837436f8c53f35fab2709d2029693258bb8578bdb8a29
    let tx = await contract.setCollateral(
        config.wethAddress, // assets
        300, // stabilityFeeValue,
        10, // liquidationFeeValue,
        70, // initialCollateralRatioValue,
        72, // liquidationRatioValue,
        0, // liquidationDiscountValue,
        1100, // devaluationPeriodValue,
        "7000000000000000000000000", // gcdLimit, 7 million
        [config.chainkinkedOracleIndex], // [] oracles,
    );
    await tx.wait()
    console.log("Set WETH as collateral tx: " + tx.hash)
}

async function setStablecoinCollateralOnManagerParameters(tokenAddress) {
    console.log("setStablecoinCollateralOnManagerParameters " + tokenAddress)
    const Factory = await ethers.getContractFactory("VaultManagerParameters")
    const contract = Factory.attach(config.vaultManagerParameters)
    
    let tx = await contract.setCollateral(
        tokenAddress, // asset
        300, // stabilityFeeValue,
        10, // liquidationFeeValue,
        92, // initialCollateralRatioValue,
        95, // liquidationRatioValue,
        0, // liquidationDiscountValue,
        1100, // devaluationPeriodValue,
        "1000000000000000000000000", // gcdLimit, 1mil
        [config.chainkinkedOracleIndex], // [] oracles,
    );
    await tx.wait()
    console.log("Set stablecoin as collateral tx: " + tx.hash)
}

async function setOGXTCollateralOnManagerParameters() {
    console.log("setOGXTCollateralOnManagerParameters")
    const Factory = await ethers.getContractFactory("VaultManagerParameters")
    const contract = Factory.attach(config.vaultManagerParameters)
    
    let tx = await contract.setCollateral(
        config.ogxtAddress, // asset
        300, // stabilityFeeValue,
        15, // liquidationFeeValue,
        40, // initialCollateralRatioValue,
        50, // liquidationRatioValue,
        0, // liquidationDiscountValue,
        3300, // devaluationPeriodValue,
        "7000000000000000000000000", // gcdLimit, 7 million
        [config.uniV3OracleIndex], // [] oracles,
    );
    await tx.wait()
    console.log("Set OGXT as collateral tx: " + tx.hash)
}

async function enableOracleTypeForWethOnVaultParams() {
    console.log("enableOracleTypeForWethOnVaultParams")
    await enableChainlinkedOracleTypeOnVaultParams(config.wethAddress)
}

async function enableOracleTypeForUSDCOnVaultParams() {
    console.log("enableOracleTypeForUSDCOnVaultParams")
    await enableChainlinkedOracleTypeOnVaultParams(config.usdcAddress)
}

async function enableChainlinkedOracleTypeOnVaultParams(tokenAddress) {
    const Factory = await ethers.getContractFactory("VaultParameters")
    const contract = Factory.attach(config.vaultParams)

    let tx = await contract.setOracleType(config.chainkinkedOracleIndex, tokenAddress, true)
    await tx.wait()
    console.log("Set chainlinked oracle for token tx: " + tx.hash)
}

async function enableOracleTypeForOGXTOnVaultParams() {
    console.log("enableOracleTypeForOGXTOnVaultParams")
    const Factory = await ethers.getContractFactory("VaultParameters")
    const contract = Factory.attach(config.vaultParams)

    // config.uniV3OracleIndex - ethereum
    // config.chainkinkedOracleIndex - bsc testnet
    let tx = await contract.setOracleType(config.chainkinkedOracleIndex, config.ogxtAddress, true)
    await tx.wait()
    console.log("Set chainlinked oracle for OGXT tx: " + tx.hash)
}

async function setChainlinkAddresses() {
    console.log("setChainlinkAddresses")
    const Factory = await ethers.getContractFactory("ChainlinkedOracleMainAsset")
    const contract = Factory.attach(config.chainlinkedOracleMainAsset)

    let tx = await contract.setAggregators(
        [  
            config.ogxtAddress,
        ], // tokenAddresses1
        [
            config.chainlinkOGXTUSDAddress,
        ], // _usdAggregators
        [], // tokenAddresses2
        [], // _ethAggregators
    )
    console.log("Set oracle addresses on Chainlinked tx: " + tx.hash)
    await tx.wait()
    console.log("Oracle addresses on Chainlinked  set")
}

async function setChainlinkAddressForWETH() {
    console.log("setChainlinkAddressForWETH")
    const Factory = await ethers.getContractFactory("ChainlinkedOracleMainAsset")
    const contract = Factory.attach(config.chainlinkedOracleMainAsset)

    let tx = await contract.setAggregators(
        [config.wethAddress], // tokenAddresses1
        [config.chainlinkETHUSDAddress], // _usdAggregators
        [], // tokenAddresses2
        [], // _ethAggregators
    )
    console.log("Set WETH chainlink address tx: " + tx.hash)
    await tx.wait()
    console.log("WETH chainlink address set")
}

async function setChainlinkAddressForUSDC() {
    console.log("setChainlinkAddressForUSDC")
    const Factory = await ethers.getContractFactory("ChainlinkedOracleMainAsset")
    const contract = Factory.attach(config.chainlinkedOracleMainAsset)

    let tx = await contract.setAggregators(
        [config.usdcAddress], // tokenAddresses1
        [config.chainlinkUSDCUSDAddress], // _usdAggregators
        [], // tokenAddresses2
        [], // _ethAggregators
    )
    console.log("Set USDC chainlink address tx: " + tx.hash)
    await tx.wait()
    console.log("USDC chainlink address set")
}

// Default quote for OGXT is USDC
async function setOGXTQuoteParamsUSDC() {
    console.log("setOGXTQuoteParamsUSDC")
    const Factory = await ethers.getContractFactory("UniswapV3OracleGCD") // No arguments
    const contract = Factory.attach(config.uniV3Oracle)

    let quoteParams = [
        config.usdcAddress, // Quote token, if "0x0000000000000000000000000000000000000000" - oracle sets default (weth)
        0, // Pool fee, default - 0.3 percent, 3000, if 0 - oracle sets default
        0 // TWAP period, default - 30 mins, if 0 - oracle sets default
    ]
    let tx = await contract.setQuoteParams(config.ogxtAddress, quoteParams)
    console.log("Set OGXT quote params USDC tx: " + tx.hash)
    await tx.wait()
    console.log("Quote params set")
}

// Extra option in case we need to quote WETH as reference, 
// there are no WETH UniV3 pools for now so this is unused
async function setOGXTQuoteParamsWeth() {
    console.log("setOGXTQuoteParamsWeth")
    const Factory = await ethers.getContractFactory("UniswapV3OracleGCD") // No arguments
    const contract = Factory.attach(config.uniV3Oracle)

    let quoteParams = [
        "0x0000000000000000000000000000000000000000", // Quote token, if "0x0000000000000000000000000000000000000000" - oracle sets default (weth)
        0, // Pool fee, default - 0.3 percent, 3000, if 0 - oracle sets default
        0 // TWAP period, default - 30 mins, if 0 - oracle sets default
    ]
    let tx = await contract.setQuoteParams(config.ogxtAddress, quoteParams)
    await tx.wait()
    console.log("Set OGXT quote params WETH tx: " + tx.hash)
}

async function borrowGCDForOGXT() {
    console.log("borrowGCDForOGXT")
    const Factory = await ethers.getContractFactory("CDPManager01")
    const contract = Factory.attach(config.cdpManager01)
    
    let tx = await contract.join(
        config.ogxtAddress, // asset
        "100000000000000000000", // collateralValue,
        "30000000000000000000" // GCD value
    );
    await tx.wait()
    console.log("Borrow tx: " + tx.hash)
}

// By default not setup
async function borrowGCDForEth() {
    console.log("borrowGCDForEth")
    const Factory = await ethers.getContractFactory("CDPManager01")
    const contract = Factory.attach(config.cdpManager01)
    
    const options = {value: ethers.utils.parseEther("0.01")} // Eth collateral
    let tx = await contract.join_Eth(
        "10000000000000000000", // GCD value,
        options
    );
    await tx.wait()
    console.log("Borrow tx: " + tx.hash)
}

async function verifyContracts() {
    // GCD Implementation
    await verify(config.gcd)
    // Vault Parameters Implementation
    await verify(config.vaultParams)
    // Vault Implementation
    await verify(config.vault)

    await verify(config.oracleRegistry, OracleRegistryConstructor)
    await verify(config.collateralRegistry, CollateralRegistryConstructor)
    await verify(config.cdpRegistry, CDPRegistryConstructor)
    await verify(config.vaultManagerParameters, VaultManagerParametersConstructor)
    await verify(config.cdpManager01, CDPManager01Constructor)
    await verify(config.chainlinkedOracleMainAsset, ChainlinkedOracleMainAssetConstructor)
    await verify(config.uniV3Oracle, UniswapV3OracleGCDConstructor)
}

async function verify(address, args) {
    try {
        await hre.run("verify:verify", {
            address: address,
            network: hre.network,
            constructorArguments: args
        });
    } catch (error) {
        console.error(error);
        return proxy
    }
}

async function redeployUniV3Oracle() {
    await deployUniV3Oracle()
    await addUniV3OracleToRegistry()
    await setOGXTQuoteParamsUSDC()
}

async function checkCoreContracts() {
    console.log("Check contracts")
    const GCDFactory = await ethers.getContractFactory("GCD")
    const contract = GCDFactory.attach(config.gcd)

    let paramsOnGCD = await contract.vaultParameters()
    console.log("GCD VaultParams: " + paramsOnGCD)

    const ParamsFactory = await ethers.getContractFactory("VaultParameters")
    const params = ParamsFactory.attach(config.vaultParams)

    let vaultOnParams = await params.vault()
    console.log("VaultParameters Vault: " + vaultOnParams)

    let multisig = await params.foundation()
    console.log("VaultParameters Multisig: " + multisig)
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
