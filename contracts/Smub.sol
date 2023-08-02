// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/** Owned by the DAO (TimeLock & GovernanceContract) */
contract Smub is Ownable {
    /** Type declarations */
    enum Position {
        PRESIDENT,
        VICE_PRESIDENT,
        HONORARY_GENERAL_SECRETARY,
        HONORARY_FINANCE_SECRETARY,
        MARKETING_DIRECTOR
    }

    /** State variables */
    mapping(Position => string) private s_exco;

    /** Events */
    /**
     * @dev emmited when Exco is updated
     */
    event UpdateExco(Position indexed position, string indexed name);

    /** Functions */

    /**
     * @notice Only owner can call this function, which means only DAO can update EXCO
     * @param _position position to set. Casted as uint8.
     * @param name name of new exco
     */
    function setExco(Position _position, string memory name) public onlyOwner {
        s_exco[_position] = name;
        emit UpdateExco(Position(_position), name);
    }

    /** View/Pure functions */

    /**
     * @notice Gets the name of the exco given the position
     * @param _position Position. Casted as uint8
     */
    function getExco(Position _position) public view returns (string memory) {
        return s_exco[_position];
    }
}
