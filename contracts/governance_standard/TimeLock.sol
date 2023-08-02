// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title TimeLock contract
 * @author Jin Han
 * @notice Sets delay between queued proposal and execution. Grants roles to different
 * addresses. Owns the Smub contract.
 */
contract TimeLock is TimelockController {
    /**
     * @param _minDelay How long to wait before executing (queue time)
     * @param _proposers List of addresses that can propose (only Governor contract)
     * @param _executors List of addresses that can execute (anyone -> 0x0 address)
     * @param _admin address of TimeLock admin (initially deployer, to be revoked)
     */
    constructor(
        uint256 _minDelay,
        address[] memory _proposers,
        address[] memory _executors,
        address _admin
    ) TimelockController(_minDelay, _proposers, _executors, _admin) {}
}
