// src/lib/wallet.js

/**
 * Wallet utilities for connecting to MetaMask and getting
 * the provider + signer needed for blockchain interaction.
 *
 * This keeps "wallet stuff" separate from UI code.
 */

import { BrowserProvider } from "ethers";

/**
 * Connects to MetaMask and returns:
 *  - provider: read-only access to the network
 *  - signer: the actual user wallet that can sign transactions
 *
 * This function is the backbone of all contract communication.
 */
export async function getProviderAndSigner() {
  // MetaMask injects `window.ethereum` into the browser.
  if (!window.ethereum) {
    throw new Error("MetaMask not detected. Please install it.");
  }

  // BrowserProvider creates an ethers provider *using* MetaMask.
  // This is what lets the frontend talk to the blockchain.
  const provider = new BrowserProvider(window.ethereum);

  // A "signer" is the active wallet selected in MetaMask (e.g. Account #1).
  const signer = await provider.getSigner();

  // Return both. The frontend chooses which one to use depending on need.
  return { provider, signer };
}
