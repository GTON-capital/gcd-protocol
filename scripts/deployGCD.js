const hre = require("hardhat");
const { ethers } = hre;

const { calculateAddressAtNonce } = require('../test/gcd/helpers/deployUtils.js');

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
    chainlinkUSDCUSDAddress: "",
}

var configGoerli = {
    chainkinkedOracleIndex: 1,
    uniV3OracleIndex: 2,
    gcd: "0x1EF834d6D3694a932A2082678EDd543E3Eb3412b",
    vaultParams: "0x634Cd07fce65a2f2930B55c7b1b20a97196d362F",
    vault: "0x097f64Be4E8De6608B1d28B3732aD480D8d45823",
    oracleRegistry: "",
    collateralRegistry: "",
    cdpRegistry: "",
    vaultManagerParameters: "",
    cdpManager01: "",
    chainlinkedOracleMainAsset: "",
    uniV3Oracle: "",
    // External contracts
    wethAddress: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    usdcAddress: "",
    gtonAddress: "0xaab9f76100e3332dc559878b0ebbf31cc4ab72e6",
    chainlinkETHUSDAddress: "",
    chainlinkUSDCUSDAddress: "",
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

const config = configGoerli

var deployer;

async function main() {
    deployer = await getDeployer()

    await deployRestOfTheCore()
}

async function getDeployer() {
    const [deployer] = await ethers.getSigners()   
    console.log("Account : ", deployer.address)
    console.log("Account balance: ", (await deployer.getBalance()).toString()) 
    return deployer
}

async function deployAndSetupRestOfTheCore() {
    await deployOracleRegistry()
    await deployCollateralRegistry()
}

async function deployAndSetupOracles() {
    
}

async function deployBaseOfCore() {
    // GCD
    const parametersAddr = calculateAddressAtNonce(deployer.address, await web3.eth.getTransactionCount(deployer.address) + 1, web3)
    const GCDFactory = await ethers.getContractFactory("GCD")
    const gcd = await GCDFactory.deploy(
        parametersAddr
    )
    await gcd.deployed()
    console.log("GCD address: ", gcd.address)
    config.gcd = gcd.address

    await delay(20000)
    try {
        await hre.run("verify:verify", {
            address: gcd.address,
            network: hre.network,
            constructorArguments: [
                parametersAddr
            ]
        });
    } catch (error) {
        console.error(error);
    }

    const vaultAddr = calculateAddressAtNonce(deployer.address, await web3.eth.getTransactionCount(deployer.address) + 1, web3)
    
    // Parameters
    const ParamsFactory = await ethers.getContractFactory("VaultParameters")
    const parameters = await ParamsFactory.deploy(
        vaultAddr,
        deployer.address // Multisig
    )
    await parameters.deployed()
    console.log("VaultParameters address: ", parameters.address)
    config.vaultParams = parameters.address

    await delay(20000)
    try {
        await hre.run("verify:verify", {
            address: parameters.address,
            network: hre.network,
            constructorArguments: [
                vaultAddr,
                deployer.address // Multisig
            ]
        });
    } catch (error) {
        console.error(error);
    }

    // Vault
    const VaultFactory = await ethers.getContractFactory("Vault")
    const vault = await VaultFactory.deploy(
        parameters.address,
        gtonAddress,
        gcd.address,
        wethAddress
    )
    await vault.deployed()
    console.log("Vault address: ", vault.address)
    config.vault = vault.address

    await delay(20000)
    try {
        await hre.run("verify:verify", {
            address: vault.address,
            network: hre.network,
            constructorArguments: [
                parameters.address,
                gtonAddress,
                gcd.address,
                wethAddress
            ]
        });
    } catch (error) {
        console.error(error);
    }
}

async function deployOracleRegistry() {
    if (config.oracleRegistry != "") { return }
    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = await Factory.deploy(
        config.vaultParams,
        config.weth
    )
    await contract.deployed()
    console.log("OracleRegistry address: ", contract.address)
    config.oracleRegistry = contract.address

    await delay(20000)
    try {
        await hre.run("verify:verify", {
            address: contract.address,
            network: hre.network,
            constructorArguments: [
                config.vaultParams,
                config.weth
            ]
        });
    } catch (error) {
        console.error(error);
    }
}

async function deployCollateralRegistry() {
    if (config.collateralRegistry != "") { return }
    const Factory = await ethers.getContractFactory("CollateralRegistry")
    const contract = await Factory.deploy(
        config.vaultParams,
        [config.gtonAddress]
    )
    await contract.deployed()
    console.log("CollateralRegistry address: ", contract.address)
    config.collateralRegistry = contract.address

    await delay(20000)
    try {
        await hre.run("verify:verify", {
            address: contract.address,
            network: hre.network,
            constructorArguments: [
                config.vaultParams,
                [config.gtonAddress]
            ]
        });
    } catch (error) {
        console.error(error);
    }
}

async function deployCDPRegistry() {
    if (config.cdpRegistry != "") { return }
    const Factory = await ethers.getContractFactory("CDPRegistry")
    const contract = await Factory.deploy(
        config.vault,
        config.collateralRegistry
    )
    await contract.deployed()
    console.log("CDPRegistry address: ", contract.address)
    config.cdpRegistry = contract.address

    await delay(20000)
    try {
        await hre.run("verify:verify", {
            address: contract.address,
            network: hre.network,
            constructorArguments: [
                config.vault,
                config.collateralRegistry
            ]
        });
    } catch (error) {
        console.error(error);
    }
}

async function deployVaultManagerParameters() {
    if (config.vaultManagerParameters != "") { return }
    const Factory = await ethers.getContractFactory("VaultManagerParameters")
    const contract = await Factory.deploy(
        config.vaultParams
    )
    await contract.deployed()
    console.log("VaultManagerParameters address: ", contract.address)
    config.vaultManagerParameters = contract.address

    await delay(20000)
    try {
        await hre.run("verify:verify", {
            address: contract.address,
            network: hre.network,
            constructorArguments: [
                config.vaultParams
            ]
        });
    } catch (error) {
        console.error(error);
    }
}

async function setVaultManagerParametersAsManagerOfVaultParams() {
    const Factory = await ethers.getContractFactory("VaultParameters")
    const contract = Factory.attach(vaultParams)
    
    let tx = await contract.setManager(vaultManagerParameters, true)
    await tx.wait()
    console.log("Set VMP as VaultParams manager tx: " + tx.hash)
}

async function deployCDPManager01() {
    if (config.cdpManager01 != "") { return }
    const Factory = await ethers.getContractFactory("CDPManager01")
    const contract = await Factory.deploy(
        config.vaultManagerParameters,
        config.oracleRegistry,
        config.cdpRegistry
    )
    await contract.deployed()
    console.log("CDPManager01 address: ", contract.address)
    config.cdpManager01 = contract.address

    await delay(20000)
    try {
        await hre.run("verify:verify", {
            address: contract.address,
            network: hre.network,
            constructorArguments: [
                config.vaultManagerParameters,
                config.oracleRegistry,
                config.cdpRegistry
            ]
        });
    } catch (error) {
        console.error(error);
    }
}

async function setCDPManagerVaultAccess() {
    const Factory = await ethers.getContractFactory("VaultParameters")
    const contract = Factory.attach(config.vaultParams)

    let tx = await contract.setVaultAccess(config.cdpManager01, true);
    await tx.wait()
    console.log("CDPManager01 as vault access entity tx: " + tx.hash)
}

async function setChainkinkedOracleWeth() {
    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = Factory.attach(config.oracleRegistry)

    let tx = await contract.setOracleTypeForAsset(config.weth, config.chainkinkedOracleIndex)
    await tx.wait()
    console.log("Set oracle type for asset tx: " + tx.hash)
}

async function setChainkinkedOracleUSDC() {
    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = Factory.attach(config.oracleRegistry)

    let tx = await contract.setOracleTypeForAsset(config.usdcAddress, config.chainkinkedOracleIndex)
    await tx.wait()
    console.log("Set oracle type for asset tx: " + tx.hash)
}

async function enableOracleTypeForWethOnVaultParams() {
    const Factory = await ethers.getContractFactory("VaultParameters")
    const contract = Factory.attach(config.vaultParams)

    let tx = await contract.setOracleType(config.chainkinkedOracleIndex, config.weth, true)
    await tx.wait()
    console.log("Set chainlinked oracle tx: " + tx.hash)
}

async function addUniV3Oracle() {
    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = Factory.attach(config.oracleRegistry)

    let tx = await contract.setOracle(config.uniV3OracleIndex, config.uniV3Oracle)
    await tx.wait()
    console.log("Set oracle tx: " + tx.hash)
}

async function setUniV3OracleGton() {
    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = Factory.attach(config.oracleRegistry)

    let tx = await contract.setOracleTypeForAsset(config.gtonAddress, config.uniV3OracleIndex)
    await tx.wait()
    console.log("Set oracle type for asset tx: " + tx.hash)
}

async function enableOracleTypeForGtonOnVaultParams() {
    const Factory = await ethers.getContractFactory("VaultParameters")
    const contract = Factory.attach(config.vaultParams)

    let tx = await contract.setOracleType(config.uniV3OracleIndex, config.gtonAddress, true)
    await tx.wait()
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
    const Factory = await ethers.getContractFactory("VaultManagerParameters")
    const contract = Factory.attach(config.vaultManagerParameters)
    
    // Same parameters as in Unit protocol:
    // https://etherscan.io/tx/0xd92d938932af61bcd2e837436f8c53f35fab2709d2029693258bb8578bdb8a29
    let tx = await contract.setCollateral(
        config.weth, // assets
        1900, // stabilityFeeValue,
        10, // liquidationFeeValue,
        50, // initialCollateralRatioValue,
        70, // liquidationRatioValue,
        0, // liquidationDiscountValue,
        3300, // devaluationPeriodValue,
        "100000000000000000000000", // gcdLimit,
        [config.chainkinkedOracleIndex], // [] oracles,
        3, // minColP,
        10, // maxColP
    );
    await tx.wait()
    console.log("Set GTON as collateral tx: " + tx.hash)
 }

async function setGtonCollateralOnManagerParameters() {
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
        "100000000000000000000000", // gcdLimit,
        [config.uniV3OracleIndex], // [] oracles,
        3, // minColP,
        10, // maxColP
    );
    await tx.wait()
    console.log("Set GTON as collateral tx: " + tx.hash)
}

async function borrowGCDForGTON() {
    const Factory = await ethers.getContractFactory("CDPManager01")
    const contract = Factory.attach(config.cdpManager01)
    
    let tx = await contract.join(
        config.gtonAddress, // asset
        "0", // collateralValue,
        "1000000000000000000" // GCD value
    );
    await tx.wait()
    console.log("Borrow tx: " + tx.hash)
}

async function borrowGCDForEth() {
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

async function deployChainlinkedOracleMainAsset() {
    if (config.chainlinkedOracleMainAsset != "") { return }
    const Factory = await ethers.getContractFactory("ChainlinkedOracleMainAsset")
    const contract = await Factory.deploy(
        [config.wethAddress], // tokenAddresses1 - usd
        [config.chainlinkETHUSDAddress], // _usdAggregators
        [], // tokenAddresses2 - eth
        [], // _ethAggregators
        config.wethAddress, // weth
        config.vaultParameters, // VaultParameters
    )
    await contract.deployed()
    console.log("ChainlinkedOracleMainAsset address: ", contract.address)
    config.chainlinkedOracleMainAsset = contract.address

    await delay(20000)
    try {
        await hre.run("verify:verify", {
            address: contract.address,
            network: hre.network,
            constructorArguments: [
                [config.wethAddress], // tokenAddresses1 - usd
                [config.chainlinkETHUSDAddress], // _usdAggregators
                [], // tokenAddresses2 - eth
                [], // _ethAggregators
                config.wethAddress, // weth
                config.vaultParameters, // VaultParameters
            ]
        });
    } catch (error) {
        console.error(error);
    }
}

async function addChainkinkedOracleToRegistry() {
    const Factory = await ethers.getContractFactory("OracleRegistry")
    const contract = Factory.attach(config.oracleRegistry)

    let tx = await contract.setOracle(config.chainkinkedOracleIndex, config.chainlinkedOracleMainAsset)
    await tx.wait()
    console.log("Set chainlinked oracle tx: " + tx.hash)
}

async function deployUniV3Oracle() {
    if (config.uniV3Oracle != "") { return }
    const Factory = await ethers.getContractFactory("UniswapV3OracleGCD") // No arguments
    const contract = await Factory.deploy(
    )
    await contract.deployed()
    console.log("UniswapV3OracleGCD address: ", contract.address)
    config.uniV3Oracle = contract.address

    await delay(20000)
    try {
        await hre.run("verify:verify", {
            address: contract.address,
            network: hre.network,
            constructorArguments: [
            ]
        });
    } catch (error) {
        console.error(error);
    }
}

async function deployMockAggregatorWethUSD() {
    if (config.chainlinkETHUSDAddress != "") { return }
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
    console.log("chainlinkETHUSDAddress address: ", contract.address)
    config.chainlinkETHUSDAddress = contract.address

    await delay(20000)
    try {
        await hre.run("verify:verify", {
            address: contract.address,
            network: hre.network,
            constructorArguments: [
                name,
                price,
                decimals
            ]
        });
    } catch (error) {
        console.error(error);
    }
}

async function deployMockAggregatorUSDCUSD() {
    if (config.chainlinkUSDCUSDAddress != "") { return }
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
    config.chainlinkUSDCUSDAddress = contract.address

    await delay(20000)
    try {
        await hre.run("verify:verify", {
            address: contract.address,
            network: hre.network,
            constructorArguments: [
                name,
                price,
                decimals
            ]
        });
    } catch (error) {
        console.error(error);
    }
}

async function setChainlinkAddressForUSDC() {
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

async function setGtonQuoteParamsWeth() {
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

async function setGtonQuoteParamsUSDC() {
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

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
