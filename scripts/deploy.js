const hre = require("hardhat");
const { ethers } = hre;

const vaultParamsRopsten = "0x634Cd07fce65a2f2930B55c7b1b20a97196d362F"
const wethRopsten = "0xc778417e063141139fce010982780140aa0cd5ab"

const vaultParams = vaultParamsRopsten
const weth = wethRopsten

async function main() {
    await deployOracleRegistry()
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

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
