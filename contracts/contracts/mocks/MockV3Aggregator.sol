// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockV3Aggregator {
    int256 public answer;

    constructor(int256 _initialAnswer) {
        answer = _initialAnswer;
    }

    function latestRoundData()
        external
        view
        returns (
            uint80,
            int256,
            uint256,
            uint256,
            uint80
        )
    {
        return (0, answer, 0, 0, 0);
    }

    function updateAnswer(int256 _answer) external {
        answer = _answer;
    }
}
