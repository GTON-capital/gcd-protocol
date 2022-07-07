// SPDX-License-Identifier: bsl-1.1

pragma solidity ^0.8.15;

import "../helpers/ERC20Like.sol";
import "../interfaces/IyvToken.sol";
import "../interfaces/IOracleUsd.sol";
import "../interfaces/IOracleRegistry.sol";
import "../interfaces/IOracleEth.sol";
import "../VaultParameters.sol";

/**
 * @title YvTokensOracle
 * @dev Wrapper to quote V2 yVault Tokens like yvWETH, yvDAI, yvUSDC, yvUSDT
 * @dev yVault Tokens list:  https://docs.yearn.finance/yearn-finance/yvaults/vault-tokens#v2-yvault-tokens
 **/

contract YvTokenOracle is IOracleUsd, Auth  {

    IOracleRegistry public immutable oracleRegistry;

    constructor(address _vaultParameters, address _oracleRegistry) Auth(_vaultParameters) {
        require(_vaultParameters != address(0) && _oracleRegistry != address(0), "GCD Protocol: ZERO_ADDRESS");
        oracleRegistry = IOracleRegistry(_oracleRegistry);
    }

    // returns Q112-encoded value
    function assetToUsd(address bearing, uint amount) public override view returns (uint) {
        if (amount == 0) return 0;
        (address underlying, uint underlyingAmount) = bearingToUnderlying(bearing, amount);
        IOracleUsd _oracleForUnderlying = IOracleUsd(oracleRegistry.oracleByAsset(underlying));
        require(address(_oracleForUnderlying) != address(0), "GCD Protocol: ORACLE_NOT_FOUND");
        return _oracleForUnderlying.assetToUsd(underlying, underlyingAmount);
    }

    function bearingToUnderlying(address bearing, uint amount) public view returns (address, uint) {
        address _underlying = IyvToken(bearing).token();
        require(_underlying != address(0), "GCD Protocol: UNDEFINED_UNDERLYING");
        uint _totalSupply = ERC20Like(bearing).totalSupply();
        require(amount <= _totalSupply, "GCD Protocol: AMOUNT_EXCEEDS_SUPPLY");
        uint _pricePerShare = IyvToken(bearing).pricePerShare();
        uint _decimals = IyvToken(bearing).decimals();
        return (_underlying, amount * _pricePerShare / (10**_decimals));
    }

}
