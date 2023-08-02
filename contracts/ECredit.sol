// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/** ERC20 Token used to vote. Extends ERC20Votes. Default settings. */
contract ECredit is ERC20Votes {
    /** State Variables */
    uint256 public s_maxSupply = 1e24;

    constructor() ERC20("ECredit", "EC") ERC20Permit("ECredit") {
        _mint(msg.sender, s_maxSupply);
    }

    /** Overridden Functions */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(
        address account,
        uint256 amount
    ) internal override(ERC20Votes) {
        super._burn(account, amount);
    }
}
