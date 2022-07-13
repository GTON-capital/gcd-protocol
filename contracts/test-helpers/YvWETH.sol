// SPDX-License-Identifier: bsl-1.1

/*
  Copyright 2020 Unit Protocol: Artem Zakharov (az@unit.xyz).
*/
pragma solidity ^0.8.15;

import "./EmptyToken.sol";

contract YvWETH is EmptyToken {

  address public token;

  uint256 public pricePerShare;


    constructor(
        uint256          _totalSupply,
        address          _token,
        uint256          _pricePerShare
    ) EmptyToken(
        "WETH yVault",
        "yvWETH",
        18,
        _totalSupply,
        msg.sender
    ) {
      token = _token;
      pricePerShare = _pricePerShare;
    }

}
