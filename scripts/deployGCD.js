const hre = require("hardhat");
const { upgrades } = require("hardhat");
const { ethers } = hre;

const { calculateAddressAtNonce } = require('../test/gcd/helpers/deployUtils.js');

var upgradableConfigRopsten = {
    chainkinkedOracleIndex: 1,
    uniV3OracleIndex: 2,
    gcd: "",
    vaultParams: "",
    vault: "",
    oracleRegistry: "",
    collateralRegistry: "",
    cdpRegistry: "",
    vaultManagerParameters: "",
    cdpManager01: "",
    chainlinkedOracleMainAsset: "",
    uniV3Oracle: "",
    // External contracts
    wethAddress: "0xc778417e063141139fce010982780140aa0cd5ab",
    usdcAddress: "0x46AfF14B22E4717934eDc2CB99bCB5Ea1185A5E8", // gtonUSDC
    gtonAddress: "0xaab9f76100e3332dc559878b0ebbf31cc4ab72e6",
    chainlinkETHUSDAddress: "0xc6d5398e7174eb8f2F831C40E0711d5d613df27E",
    chainlinkUSDCUSDAddress: "0x801bBB7A8C4B54BcC3f787da400694223dAe6731",
}

var configEthereum = {
    chainkinkedOracleIndex: 1,
    uniV3OracleIndex: 2,
    gcd: "",
    vaultParams: "",
    vault: "",
    oracleRegistry: "",
    collateralRegistry: "",
    cdpRegistry: "",
    vaultManagerParameters: "",
    cdpManager01: "",
    chainlinkedOracleMainAsset: "",
    uniV3Oracle: "",
    // External contracts
    wethAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    usdcAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    gtonAddress: "0x01e0e2e61f554ecaaec0cc933e739ad90f24a86d",
    chainlinkETHUSDAddress: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    chainlinkUSDCUSDAddress: "0x8fffffd4afb6115b954bd326cbe7b4ba576818f6",
}

var configGoerli = {
    chainkinkedOracleIndex: 1,
    uniV3OracleIndex: 2,
    gcd: "0x1EF834d6D3694a932A2082678EDd543E3Eb3412b",
    vaultParams: "0x634Cd07fce65a2f2930B55c7b1b20a97196d362F",
    vault: "0x097f64Be4E8De6608B1d28B3732aD480D8d45823",
    oracleRegistry: "0xC0B881e21eE1B847A659206C0214E3357788E88E",
    collateralRegistry: "0x545A51D0A95C2EACbD49F4bEDEb4426dB31D113C",
    cdpRegistry: "0x9905EB831b103f8aB1F4da5707ef5400ff27d62D",
    vaultManagerParameters: "0x5f442aE49f1a17954bB1490F8fa6F1c5E04afFd0",
    cdpManager01: "0x9499e7a07Ec60731F2b063A5F29595DB02eF6567",
    chainlinkedOracleMainAsset: "0xC8159047230668ffa0Fe7a026d2a5BC4D95bf981",
    uniV3Oracle: "0xE70fFd03131675258bd421e98e5552FDfd01aDeA",
    // External contracts
    wethAddress: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    usdcAddress: "0x46AfF14B22E4717934eDc2CB99bCB5Ea1185A5E8",
    gtonAddress: "0xaab9f76100e3332dc559878b0ebbf31cc4ab72e6",
    chainlinkETHUSDAddress: "0x7b349BaEf511419454B78cd0e2046861Bc0aEb48",
    chainlinkUSDCUSDAddress: "0x684EF2E18b9e1AEFeeAF82BEF1cFe37f3F07f162",
}

var configRopsten = {
    chainkinkedOracleIndex: 1,
    uniV3OracleIndex: 2,
    gcd: "0x1ef834d6d3694a932a2082678edd543e3eb3412b",
    vaultParams: "0x634Cd07fce65a2f2930B55c7b1b20a97196d362F",
    vault: "0x097f64Be4E8De6608B1d28B3732aD480D8d45823",
    oracleRegistry: "0x85d7676ff4339C7e59eb7e90F160E909fc65d3bd",
    collateralRegistry: "0x5018c2a74015e09D9B72ac9571D2Ff5594355b63",
    cdpRegistry: "0xD0011dE099E514c2094a510dd0109F91bf8791Fa",
    vaultManagerParameters: "0x3c4925B50e337aeCC2cF4B9E4767B43DcfbaD286",
    cdpManager01: "0x7023401be71E1D8C8c9548933A2716aB3234E754",
    chainlinkedOracleMainAsset: "0x406B838E5Ac09D90e7cB48187AD7f4075184eB28",
    uniV3Oracle: "0xC8159047230668ffa0Fe7a026d2a5BC4D95bf981",
    // External contracts
    wethAddress: "0xc778417e063141139fce010982780140aa0cd5ab",
    usdcAddress: "0x46AfF14B22E4717934eDc2CB99bCB5Ea1185A5E8", // gtonUSDC
    gtonAddress: "0xaab9f76100e3332dc559878b0ebbf31cc4ab72e6",
    chainlinkETHUSDAddress: "0xc6d5398e7174eb8f2F831C40E0711d5d613df27E",
    chainlinkUSDCUSDAddress: "0x801bBB7A8C4B54BcC3f787da400694223dAe6731",
}

const config = upgradableConfigRopsten

var deployer;

async function main() {
    deployer = await getDeployer()

    await deployBaseOfCore()
    await deployAndSetupRestOfTheCore()
    await deployAndSetupOracles()
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

async function deployAndSetupOracles() {
    // Deploy Chainlink pricefeeds, mocks if not present
    await deployMockAggregatorWethUSD()
    await deployMockAggregatorUSDCUSD()
    // Deploy base proxies
    await deployChainlinkedOracleMainAsset()
    await deployUniV3Oracle()
    // Setup of oracles
    await addChainkinkedOracleToRegistry()
    await addUniV3OracleToRegistry()
    await setChainlinkAddressForWETH()
    await setChainlinkAddressForUSDC()
    await setChainkinkedOracleWeth()
    await setChainkinkedOracleUSDC()
    await setUniV3OracleGton()
    // Setting collateral
    // WETH
    await enableOracleTypeForWethOnVaultParams()
    await setWethCollateralOnManagerParameters()
    // USDC
    await enableOracleTypeForUSDCOnVaultParams()
    // GTON
    await enableOracleTypeForGtonOnVaultParams()
    await setGtonCollateralOnManagerParameters()
    await setGtonQuoteParamsUSDC()
}

async function deploy(factoryName, args) {
    const Factory = await ethers.getContractFactory(factoryName)
    const contract = await Factory.deploy(...args)
    await contract.deployed()
    console.log(factoryName + " address: ", contract.address)

    await delay(30000)
    try {
        await hre.run("verify:verify", {
            address: contract.address,
            network: hre.network,
            constructorArguments: args
        });
    } catch (error) {
        console.error(error);
    }
    return contract
}

async function deployInitializable(factoryName, args) {
    const Factory = await ethers.getContractFactory(factoryName)
    const proxy = await upgrades.deployProxy(Factory, args, { initializer: 'initialize' });
    await proxy.deployed()
    console.log(factoryName + " proxy address: ", proxy.address)

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxy.address)
    console.log(factoryName + " implementation address: ", implementationAddress)

    await delay(30000)
    try {
        await hre.run("verify:verify", {
            address: implementationAddress,
            network: hre.network
        });
    } catch (error) {
        console.error(error);
    }
    return proxy
}

async function deployBaseOfCore() {
    // GCD
    const parametersAddr = calculateAddressAtNonce(deployer.address, await web3.eth.getTransactionCount(deployer.address) + 1, web3)
    const gcd = await deployInitializable("GCD", [parametersAddr])
    config.gcd = gcd.address

    // Parameters
    const vaultAddr = calculateAddressAtNonce(deployer.address, await web3.eth.getTransactionCount(deployer.address) + 1, web3)
    const parameters = await deployInitializable("VaultParameters", [
        vaultAddr,
        deployer.address // Multisig
    ])
    config.vaultParams = parameters.address

    // Vault
    const vault = await deployInitializable("Vault", [
        config.vaultParams,
        config.gtonAddress,
        config.gcd,
        config.wethAddress
    ])
    config.vault = vault.address
}

async function deployOracleRegistry() {
    console.log("deployOracleRegistry")
    if (config.oracleRegistry != "") { console.log("Already deployed"); return }
    const contract = await deploy("OracleRegistry", [
        config.vaultParams,
        config.wethAddress
    ])
    config.oracleRegistry = contract.address
}

async function deployCollateralRegistry() {
    console.log("deployCollateralRegistry")
    if (config.collateralRegistry != "") { console.log("Already deployed"); return }
    const contract = await deploy("CollateralRegistry", [
        config.vaultParams,
        [config.gtonAddress]
    ])
    config.collateralRegistry = contract.address
}

async function deployCDPRegistry() {
    console.log("deployCDPRegistry")
    if (config.cdpRegistry != "") { console.log("Already deployed"); return }
    const contract = await deploy("CDPRegistry", [
        config.vault,
        config.collateralRegistry
    ])
    config.cdpRegistry = contract.address
}

async function deployVaultManagerParameters() {
    console.log("deployVaultManagerParameters")
    if (config.vaultManagerParameters != "") { console.log("Already deployed"); return }
    const contract = await deploy("VaultManagerParameters", [
        config.vaultParams
    ])
    config.vaultManagerParameters = contract.address
}

async function deployCDPManager01() {
    console.log("deployCDPManager01")
    if (config.cdpManager01 != "") { console.log("Already deployed"); return }
    const contract = await deploy("CDPManager01", [
        config.vaultManagerParameters,
        config.oracleRegistry,
        config.cdpRegistry
    ])
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

async function deployMockAggregatorWethUSD() {
    console.log("deployMockAggregatorWethUSD")
    if (config.chainlinkETHUSDAddress != "") { console.log("Already deployed"); return }
    const name = "ETH / USD"
    const price = 178954000000
    const decimals = 8

    const contract = await deploy("MockAggregator", [
        name,
        price,
        decimals
    ])
    config.chainlinkETHUSDAddress = contract.address
}

async function deployMockAggregatorUSDCUSD() {
    console.log("deployMockAggregatorUSDCUSD")
    if (config.chainlinkUSDCUSDAddress != "") { console.log("Already deployed"); return }
    const name = "USDC / USD"
    const price = 100000000
    const decimals = 8

    const contract = await deploy("MockAggregator", [
        name,
        price,
        decimals
    ])
    config.chainlinkUSDCUSDAddress = contract.address
}

async function deployChainlinkedOracleMainAsset() {
    console.log("deployChainlinkedOracleMainAsset")
    if (config.chainlinkedOracleMainAsset != "") { console.log("Already deployed"); return }
    const contract = await deploy("ChainlinkedOracleMainAsset", [
        [config.wethAddress], // tokenAddresses1 - usd
        [config.chainlinkETHUSDAddress], // _usdAggregators
        [], // tokenAddresses2 - eth
        [], // _ethAggregators
        config.wethAddress, // weth
        config.vaultParams, // VaultParameters
    ])
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

async function deployUniV3Oracle() {
    console.log("deployUniV3Oracle")
    // throw "Don't forget to set VaultParameters & defaultQuoteAsset in contract code"
    if (config.uniV3Oracle != "") { console.log("Already deployed"); return }
    const contract = await deploy("UniswapV3OracleGCD", [
    ])
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
    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = Factory.attach(config.oracleRegistry)

    let tx = await contract.setOracleTypeForAsset(config.wethAddress, config.chainkinkedOracleIndex)
    await tx.wait()
    console.log("Set oracle type for WETH tx: " + tx.hash)
}

async function setChainkinkedOracleUSDC() {
    console.log("setChainkinkedOracleUSDC")
    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = Factory.attach(config.oracleRegistry)

    let tx = await contract.setOracleTypeForAsset(config.usdcAddress, config.chainkinkedOracleIndex)
    await tx.wait()
    console.log("Set oracle type for USDC tx: " + tx.hash)
}

async function setUniV3OracleGton() {
    console.log("setUniV3OracleGton")
    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = Factory.attach(config.oracleRegistry)

    let tx = await contract.setOracleTypeForAsset(config.gtonAddress, config.uniV3OracleIndex)
    await tx.wait()
    console.log("Set oracle type for GTON tx: " + tx.hash)
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
     * @param minColP The min percentage of COL value in position (0 decimals)
     * @param maxColP The max percentage of COL value in position (0 decimals)
     **/

 async function setWethCollateralOnManagerParameters() {
    console.log("setWethCollateralOnManagerParameters")
    const Factory = await ethers.getContractFactory("VaultManagerParameters")
    const contract = Factory.attach(config.vaultManagerParameters)
    
    // Same parameters as in Unit protocol:
    // https://etherscan.io/tx/0xd92d938932af61bcd2e837436f8c53f35fab2709d2029693258bb8578bdb8a29
    let tx = await contract.setCollateral(
        config.wethAddress, // assets
        1900, // stabilityFeeValue,
        10, // liquidationFeeValue,
        50, // initialCollateralRatioValue,
        70, // liquidationRatioValue,
        0, // liquidationDiscountValue,
        3300, // devaluationPeriodValue,
        "100000000000000000000000", // gcdLimit, 100k
        [config.chainkinkedOracleIndex], // [] oracles,
        3, // minColP,
        10, // maxColP
    );
    await tx.wait()
    console.log("Set GTON as collateral tx: " + tx.hash)
 }

async function setGtonCollateralOnManagerParameters() {
    console.log("setGtonCollateralOnManagerParameters")
    const Factory = await ethers.getContractFactory("VaultManagerParameters")
    const contract = Factory.attach(config.vaultManagerParameters)
    
    let tx = await contract.setCollateral(
        config.gtonAddress, // asset
        2300, // stabilityFeeValue,
        15, // liquidationFeeValue,
        30, // initialCollateralRatioValue,
        60, // liquidationRatioValue,
        0, // liquidationDiscountValue,
        3300, // devaluationPeriodValue,
        "100000000000000000000000", // gcdLimit, 100k
        [config.uniV3OracleIndex], // [] oracles,
        3, // minColP,
        10, // maxColP
    );
    await tx.wait()
    console.log("Set GTON as collateral tx: " + tx.hash)
}

async function enableOracleTypeForWethOnVaultParams() {
    console.log("enableOracleTypeForWethOnVaultParams")
    const Factory = await ethers.getContractFactory("VaultParameters")
    const contract = Factory.attach(config.vaultParams)

    let tx = await contract.setOracleType(config.chainkinkedOracleIndex, config.wethAddress, true)
    await tx.wait()
    console.log("Set chainlinked oracle for WETH tx: " + tx.hash)
}

async function enableOracleTypeForUSDCOnVaultParams() {
    console.log("enableOracleTypeForUSDCOnVaultParams")
    const Factory = await ethers.getContractFactory("VaultParameters")
    const contract = Factory.attach(config.vaultParams)

    let tx = await contract.setOracleType(config.chainkinkedOracleIndex, config.usdcAddress, true)
    await tx.wait()
    console.log("Set chainlinked oracle for USDC tx: " + tx.hash)
}

async function enableOracleTypeForGtonOnVaultParams() {
    console.log("enableOracleTypeForGtonOnVaultParams")
    const Factory = await ethers.getContractFactory("VaultParameters")
    const contract = Factory.attach(config.vaultParams)

    let tx = await contract.setOracleType(config.uniV3OracleIndex, config.gtonAddress, true)
    await tx.wait()
    console.log("Set chainlinked oracle for GTON tx: " + tx.hash)
}


async function setChainlinkAddressForWETH() {
    console.log("setChainlinkAddressForWETH")
    const Factory = await ethers.getContractFactory("ChainlinkedOracleMainAsset")
    const contract = Factory.attach(config.chainlinkedOracleMainAsset)

    let tx = await contract.setAggregators(
        [config.usdcAddress], // tokenAddresses1
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

// Default quote for GTON is USDC
async function setGtonQuoteParamsUSDC() {
    console.log("setGtonQuoteParamsUSDC")
    const Factory = await ethers.getContractFactory("UniswapV3OracleGCD") // No arguments
    const contract = Factory.attach(config.uniV3Oracle)

    let quoteParams = [
        config.usdcAddress, // Quote token, if "0x0000000000000000000000000000000000000000" - oracle sets default (weth)
        0, // Pool fee, default - 0.3 percent, 3000, if 0 - oracle sets default
        0 // TWAP period, default - 30 mins, if 0 - oracle sets default
    ]
    let tx = await contract.setQuoteParams(config.gtonAddress, quoteParams)
    console.log("Set GTON quote params USDC tx: " + tx.hash)
    await tx.wait()
    console.log("Quote params set")
}

// Extra option in case we need to quote WETH as reference, 
// there are no WETH UniV3 pools for now so this is unused
async function setGtonQuoteParamsWeth() {
    console.log("setGtonQuoteParamsWeth")
    const Factory = await ethers.getContractFactory("UniswapV3OracleGCD") // No arguments
    const contract = Factory.attach(config.uniV3Oracle)

    let quoteParams = [
        "0x0000000000000000000000000000000000000000", // Quote token, if "0x0000000000000000000000000000000000000000" - oracle sets default (weth)
        0, // Pool fee, default - 0.3 percent, 3000, if 0 - oracle sets default
        0 // TWAP period, default - 30 mins, if 0 - oracle sets default
    ]
    let tx = await contract.setQuoteParams(config.gtonAddress, quoteParams)
    await tx.wait()
    console.log("Set GTON quote params WETH tx: " + tx.hash)
}

async function borrowGCDForGTON() {
    console.log("borrowGCDForGTON")
    const Factory = await ethers.getContractFactory("CDPManager01")
    const contract = Factory.attach(config.cdpManager01)
    
    let tx = await contract.join(
        config.gtonAddress, // asset
        "10000000000000000000", // collateralValue,
        "1000000000000000000" // GCD value
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
        "1", // GCD value,
        options
    );
    await tx.wait()
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
