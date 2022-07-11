// execution error

const hre = require("hardhat");
const { ethers } = hre;

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

async function deployMockRandomAggregatorWethUSD() {
    const name = "ETH / USD"
    const price = 120554000000
    const decimals = 8

    const Factory = await ethers.getContractFactory("MockRandomAggregator")
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

async function bumpNonce(desiredNonce) {  
    console.log("Bumping TX to nonce: " + desiredNonce)
    let txData = {
      to: "0x50DF0af8a06f82fCcB0aCb77D8c986785b36d734",
      value: 1
    }

    while (await ethers.provider.getTransactionCount(deployer.address) < desiredNonce) {
      console.log(await ethers.provider.getTransactionCount(deployer.address))
      let tx = await deployer.sendTransaction(txData)
      console.log(tx.hash)
      await tx.wait()
    }
  }

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
