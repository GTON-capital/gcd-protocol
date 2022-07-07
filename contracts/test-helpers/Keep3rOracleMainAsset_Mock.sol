// SPDX-License-Identifier: bsl-1.1

/*
  Copyright 2020 Unit Protocol: Artem Zakharov (az@unit.xyz).
*/
pragma solidity ^0.8.15;

import "../helpers/ERC20Like.sol";
import "../interfaces/IAggregator.sol";
import "../helpers/IUniswapV2Factory.sol";
import "../oracles/OracleSimple.sol";

/**
 * @title Keep3rOracleMainAsset_Mock
 * @dev Calculates the USD price of desired tokens
 **/
contract Keep3rOracleMainAsset_Mock is ChainlinkedOracleSimple {

    uint public immutable Q112 = 2 ** 112;
    uint public immutable ETH_USD_DENOMINATOR = 100000000;

    IAggregator public immutable ethUsdChainlinkAggregator;

    UniswapV2FactoryI public immutable uniswapFactory;

    constructor(
        UniswapV2FactoryI uniFactory,
        address weth,
        IAggregator chainlinkAggregator
    )
    {
        require(address(uniFactory) != address(0), "GCD Protocol: ZERO_ADDRESS");
        require(weth != address(0), "GCD Protocol: ZERO_ADDRESS");
        require(address(chainlinkAggregator) != address(0), "GCD Protocol: ZERO_ADDRESS");

        uniswapFactory = uniFactory;
        WETH = weth;
        ethUsdChainlinkAggregator = chainlinkAggregator;
    }

    // override with mock; only for tests
    function assetToUsd(address asset, uint amount) public override view returns (uint) {

        if (asset == WETH) {
            return ethToUsd(amount);
        }

        address uniswapPair = uniswapFactory.getPair(asset, WETH);
        require(uniswapPair != address(0), "GCD Protocol: UNISWAP_PAIR_DOES_NOT_EXIST");

        // token reserve of {Token}/WETH pool
        uint tokenReserve = ERC20Like(asset).balanceOf(uniswapPair);

        // revert if there is no liquidity
        require(tokenReserve != 0, "GCD Protocol: UNISWAP_EMPTY_POOL");

        // WETH reserve of {Token}/WETH pool
        uint wethReserve = ERC20Like(WETH).balanceOf(uniswapPair);

        uint wethResult = amount * wethReserve;

        return ethToUsd(wethResult) * Q112 / tokenReserve;
    }

    function assetToEth(address asset, uint amount) public override view returns (uint) {
        if (asset == WETH) {
            return amount;
        }

        address uniswapPair = uniswapFactory.getPair(asset, WETH);
        require(uniswapPair != address(0), "GCD Protocol: UNISWAP_PAIR_DOES_NOT_EXIST");

        // token reserve of {Token}/WETH pool
        uint tokenReserve = ERC20Like(asset).balanceOf(uniswapPair);

        // revert if there is no liquidity
        require(tokenReserve != 0, "GCD Protocol: UNISWAP_EMPTY_POOL");

        // WETH reserve of {Token}/WETH pool
        uint wethReserve = ERC20Like(WETH).balanceOf(uniswapPair);

        return amount * wethReserve * Q112;
    }

    /**
     * @notice ETH/USD price feed from Chainlink, see for more info: https://feeds.chain.link/eth-usd
     * returns Price of given amount of Ether in USD (0 decimals)
     **/
    function ethToUsd(uint ethAmount) public override view returns (uint) {
        require(ethUsdChainlinkAggregator.latestTimestamp() > block.timestamp - 6 hours, "GCD Protocol: OUTDATED_CHAINLINK_PRICE");
        uint ethUsdPrice = uint(ethUsdChainlinkAggregator.latestAnswer());
        return ethAmount * ethUsdPrice / ETH_USD_DENOMINATOR;
    }
}
