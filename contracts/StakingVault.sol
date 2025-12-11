// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title StakingVault
 * @notice A minimal ETH vault for practicing Solidity fundamentals.
 *
 * This contract lets users:
 *  - deposit ETH
 *  - withdraw ETH
 *  - view their balance
 *
 * It is intentionally simple — perfect for learning.
 */
contract StakingVault {

    /**
     * @notice Stores how much ETH each user has deposited.
     *
     * mapping(address => uint256):
     * - The key is a wallet address.
     * - The value is the total amount of ETH they currently have in the vault.
     *
     * Example:
     * balances[0x123...] = 5 ether;
     */
    mapping(address => uint256) public balances;
    uint256 public totalStaked;

    /**
     * @notice Emitted every time a user deposits ETH into the vault.
     *
     * indexed: allows blockchain explorers and analytics tools
     *          to filter events by user address efficiently.
     */
    event Deposited(address indexed user, uint256 amount);

    /**
     * @notice Emitted every time a user withdraws ETH from the vault.
     */
    event Withdrawn(address indexed user, uint256 amount);


    /**
     * @notice Allows anyone to deposit ETH into the vault.
     *
     * `external payable`:
     * - external: can be called only from outside the contract
     * - payable: lets the function receive ETH
     *
     * msg.value:
     * - how much ETH was sent along with the transaction
     *
     * We update the mapping → add their new deposit to their balance.
     * Then we emit an event so the action is recorded on-chain.
     */
    function deposit() external payable {
        require(msg.value > 0, "Must deposit > 0");

        balances[msg.sender] += msg.value;

        // Track how much ETH is in the vault in total.
        totalStaked += msg.value;

        emit Deposited(msg.sender, msg.value);
    }


    /**
     * @notice Allows the caller to withdraw a specified amount of ETH.
     *
     * Steps:
     * 1. Check that the user has enough ETH in the vault.
     * 2. Subtract the amount from their vault balance.
     * 3. Transfer ETH back to the user using `.call{value: amount}("")`.
     *    - This is the recommended safe way in 0.8+.
     * 4. Confirm the transfer worked.
     * 5. Emit an event.
     *
     * @param amount How much ETH the user wants to withdraw.
     */
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Not enough balance");

        // update state FIRST (checks-effects-interactions pattern)
        balances[msg.sender] -= amount;

        // Reduce the global total as well.
        totalStaked -= amount;

        // transfer ETH back to user safely
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Withdraw failed");

        emit Withdrawn(msg.sender, amount);
    }


    /**
     * @notice Convenience function that returns the caller’s current vault balance.
     *
     * external view:
     * - external: only callable from outside
     * - view: reads state but does not modify it
     *
     * This is optional, since `balances(address)` is already public,
     * but it's nice syntactic sugar for dApps and scripts.
     */
    function myBalance() external view returns (uint256) {
        return balances[msg.sender];
    }
}
