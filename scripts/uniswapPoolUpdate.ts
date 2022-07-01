const hre = require("hardhat");
const { ethers } = hre;

const UniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json");

// const poolAddressRopsten = "0xd2a6d30c2037390dc8e247d6b7e0ec11e3047499" // fee - 10000
const poolAddressRopsten = "0xf3a495bc52ae01815cd4b65b0300c894d86e713a" // fee - 3000
const poolAddressGoerli = "0xf3a495bc52ae01815cd4b65b0300c894d86e713a" // fee - 3000
const poolAddressEthereum = "0xe40a2eab69d4de66bccb0ac8e2517a230c6312e8"
const poolAddress = poolAddressGoerli

async function main() {
    await increaseCardinality()
}

async function increaseCardinality() {
    let contract = await getContract()

    // 144 - roughly 30 mins, we take a little bit more
    let tx = await contract.increaseObservationCardinalityNext(150) 
    await tx.wait()
    console.log("Tx hash:  " + tx.hash)
}

async function observe() {
    let contract = await getContract()

    let result = await contract.observe([500])
    console.log("Result: " + result)
}

async function readFee() {
    let contract = await getContract()

    let result = await contract.fee()
    console.log("Result: " + result)
}

async function getContract() {
    console.log(process.argv)
    const [deployer] = await ethers.getSigners()

    console.log("Account : ", deployer.address)
    console.log("Account balance: ", (await deployer.getBalance()).toString())

    const contract = new hre.ethers.Contract(poolAddress, UniswapV3Pool.abi, deployer);
    return contract
}

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
