// SPDX-License-Identifier: bsl-1.1

/*
  Copyright 2020 Unit Protocol: Artem Zakharov (az@unit.xyz).
*/
pragma solidity ^0.8.15;

import "./KeydonixOracleAbstract.sol";

/**
 * @title ChainlinkedKeydonixOracleMainAssetAbstract
 **/
abstract contract ChainlinkedKeydonixOracleMainAssetAbstract is KeydonixOracleAbstract {

    address public WETH;

    function assetToEth(
        address asset,
        uint amount,
        ProofDataStruct memory proofData
    ) public virtual view returns (uint);

    function ethToUsd(uint ethAmount) public virtual view returns (uint);
}
