// src/lib/vault.js

/**
 * Functions for constructing contract instances (read or write).
 *
 * This isolates all contract interaction logic,
 * so App.jsx stays simple and UI-focused.
 */

import { Contract } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../vaultConfig";
import { getProviderAndSigner } from "./wallet";

/**
 * Returns a *read-only* version of the contract.
 * Use this for:
 *   - balances()
 *   - totalStaked()
 *   - myBalance()
 *
 * Anything that doesn't cost ETH should use "read mode".
 */
export async function getVaultRead() {
  const { provider } = await getProviderAndSigner();
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

/**
 * Returns a *write-enabled* version of the contract.
 * Use this for:
 *   - deposit()
 *   - withdraw()
 *
 * This version requires the user's wallet to sign transactions.
 */
export async function getVaultWrite() {
  const { signer } = await getProviderAndSigner();
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}
