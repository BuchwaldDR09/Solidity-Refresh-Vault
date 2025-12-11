// src/vaultConfig.js

/**
 * Configuration file holding contract data:
 *  - deployed address (from Hardhat deploy)
 *  - minimal ABI (just the functions the UI needs)
 *
 * Keeping this separate makes it easy to swap networks or addresses.
 */

// The address printed by your Hardhat deploy script.
// This is WHERE the contract lives on your local Hardhat chain.
export const CONTRACT_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

/**
 * Minimal ABI:
 * We only include the functions the UI actually calls.
 * This keeps the frontend lightweight and more secure.
 */
export const CONTRACT_ABI = [
  // balances(address) → uint256
  // Automatically generated getter for the public mapping in Solidity.
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "balances",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // totalStaked() → uint256
  {
    inputs: [],
    name: "totalStaked",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // deposit() payable
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },

  // withdraw(uint256)
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // myBalance() → uint256
  {
    inputs: [],
    name: "myBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  }
];
