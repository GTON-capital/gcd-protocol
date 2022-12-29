// SPDX-License-Identifier: bsl-1.1

/*
  Copyright 2020 Unit Protocol: Artem Zakharov (az@unit.xyz).
*/
pragma solidity ^0.8.15;

import "../helpers/IUniswapV2PairFull.sol";
import "../interfaces/IOracleEth.sol";
import "../interfaces/IOracleUsd.sol";
import "../interfaces/IOracleRegistry.sol";
import "../interfaces/IToken.sol";

/**
 * @title OraclePoolToken
 * @dev Calculates the USD price of Uniswap LP tokens
 **/
contract OraclePoolToken is IOracleUsd {

    IOracleRegistry public immutable oracleRegistry;

    address public immutable WETH;

    uint public immutable Q112 = 2 ** 112;

    constructor(address _oracleRegistry) {
        oracleRegistry = IOracleRegistry(_oracleRegistry);
        WETH = IOracleRegistry(_oracleRegistry).WETH();
    }

    /**
     * @notice Flashloan-resistant logic to determine USD price of Uniswap LP tokens
     * @notice Pair must be registered at Chainlink
     * @param asset The LP token address
     * @param amount Amount of asset
     * @return Q112 encoded price of asset in USD
     **/
    function assetToUsd(
        address asset,
        uint amount
    )
        public
        override
        view
        returns (uint)
    {
        IUniswapV2PairFull pair = IUniswapV2PairFull(asset);
        address underlyingAsset;
        if (pair.token0() == WETH) {
            underlyingAsset = pair.token1();
        } else if (pair.token1() == WETH) {
            underlyingAsset = pair.token0();
        } else {
            revert("GCD Protocol: NOT_REGISTERED_PAIR");
        }

        address oracle = oracleRegistry.oracleByAsset(underlyingAsset);
        require(oracle != address(0), "GCD Protocol: ORACLE_NOT_FOUND");

        uint eAvg;

        { // fix stack too deep
          uint assetPrecision = 10 ** IToken(underlyingAsset).decimals();

          uint usdValue_q112 = IOracleUsd(oracle).assetToUsd(underlyingAsset, assetPrecision) / assetPrecision;
          // average price of 1 token unit in ETH
          eAvg = IOracleEth(oracleRegistry.oracleByAsset(WETH)).usdToEth(usdValue_q112);
        }

        (uint112 _reserve0, uint112 _reserve1,) = pair.getReserves();
        uint aPool; // current asset pool
        uint ePool; // current WETH pool
        if (pair.token0() == underlyingAsset) {
            aPool = uint(_reserve0);
            ePool = uint(_reserve1);
        } else {
            aPool = uint(_reserve1);
            ePool = uint(_reserve0);
        }

        uint eCurr = ePool * Q112 / aPool; // current price of 1 token in WETH
        uint ePoolCalc; // calculated WETH pool

        if (eCurr < eAvg) {
            // flashloan buying WETH
            uint sqrtd = ePool * ((ePool * 9 + 
                aPool ) * 3988000 * eAvg / Q112
            );
            uint eChange = sqrt(sqrtd) - ePool * 1997 / 2000;
            ePoolCalc = ePool + eChange;
        } else {
            // flashloan selling WETH
            uint a = aPool * eAvg;
            uint b = a * 9 / Q112;
            uint c = ePool * 3988000;
            uint sqRoot = sqrt(a / Q112 * (b + c));
            uint d = a * 3 / Q112;
            uint eChange = ePool - (d + sqRoot) / 2000;
            ePoolCalc = ePool - eChange;
        }

        uint num = ePoolCalc * 2 * amount;
        uint priceInEth;
        if (num > Q112) {
            priceInEth = num / pair.totalSupply() * Q112;
        } else {
            priceInEth = num * Q112 / pair.totalSupply();
        }

        return IOracleEth(oracleRegistry.oracleByAsset(WETH)).ethToUsd(priceInEth);
    }

    function sqrt(uint x) internal pure returns (uint y) {
        if (x > 3) {
            uint z = x / 2 + 1;
            y = x;
            while (z < y) {
                y = z;
                z = (x / z + z) / 2;
            }
        } else if (x != 0) {
            y = 1;
        }
    }
}
