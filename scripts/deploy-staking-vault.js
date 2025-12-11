// scripts/deploy-staking-vault.js
//
// This script deploys the StakingVault contract using Hardhat v3 + ethers.

import hre from "hardhat";

// Hardhat v3: get an ethers instance connected to the selected network.
const { ethers } = await hre.network.connect();

async function main() {
  // Get the first signer/account Hardhat gives us.
  const [deployer] = await ethers.getSigners();

  console.log("Deploying StakingVault with account:", deployer.address);

  // Deploy the contract by name (must match the Solidity contract name).
  const vault = await ethers.deployContract("StakingVault");

  // Wait for the deployment transaction to be mined.
  await vault.waitForDeployment();

  const address = await vault.getAddress();
  console.log("StakingVault deployed to:", address);
}

// Standard pattern: run main() and handle any errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
