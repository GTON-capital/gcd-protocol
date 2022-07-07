// SPDX-License-Identifier: bsl-1.1

/*
  Copyright 2020 Unit Protocol: Artem Zakharov (az@unit.xyz).
*/
pragma solidity ^0.8.15;

interface IStableSwap  {
  function get_dy(uint256 x, uint256 y, uint256 dx) external view returns (uint256);
}
