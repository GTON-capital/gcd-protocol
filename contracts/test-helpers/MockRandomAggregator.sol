//SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "../interfaces/IAggregator.sol";

contract MockRandomAggregator is IAggregator {

    string name;
    int256 price;
    uint8 dec;
    address owner;

    constructor(
        string memory name_,
        int256 price_,
        uint8 decimals_
    ) { 
        name = name_;
        price = price_;
        dec = decimals_;
        owner = msg.sender;
    }

    function decimals() public override view returns (uint256) {
        return dec;
    }

    function description() public view returns (string memory) {
        return name;
    }

    function version() public view returns (uint256) {
        return 0;
    }

    function getRoundData(uint80 _roundId)
        public
        view
        returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        uint256 pseaudoRandom = block.timestamp % 100;
        return (0, price + (int256(pseaudoRandom) - 50) * 2 * 10e6, 0, block.timestamp, 0);
    }

    function latestRoundData()
        public
        override
        view
        returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        uint256 pseaudoRandom = block.timestamp % 100;
        return (0, price + (int256(pseaudoRandom) - 50) * 2 * 10e6, 0, block.timestamp, 0);
    }

    function updatePriceAndDecimals(
        int256 price_,
        uint8 decimals_
    ) public {
        require(msg.sender == owner, "Not owner");
        price = price_;
        dec = decimals_;
    }

    function getAnswer(uint256 roundId) external override view returns (int256) {
        return price;
    }

    function getTimestamp(uint256 roundId) external override view returns (uint256) {
        return uint256(block.timestamp);
    }

    function latestAnswer() external override view returns (int256) {
        return price;
    }

    function latestRound() external override view returns (uint256) {
        return uint256(price);
    }

    function latestTimestamp() external override view returns (uint256) {
        return uint256(block.timestamp);
    }
}
