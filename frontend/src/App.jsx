// @ts-nocheck

// src/App.jsx

/**
 * Main React component for the Staking Vault dApp.
 *
 * This component:
 *  - Connects to MetaMask
 *  - Reads the user's vault balance and total staked
 *  - Sends transactions to deposit and withdraw ETH
 *  - Renders the main UI layout
 */

import { useState } from "react";

// ethers helpers for value conversions:
// parseEther("0.1") → wei (bigint)
// formatEther(wei) → string like "0.1"
import { parseEther, formatEther } from "ethers";

// Custom helper modules (your logic files)
import { getVaultRead, getVaultWrite } from "./lib/vault";
import { getProviderAndSigner } from "./lib/wallet";

// Presentational component to show balances
import VaultCard from "./components/VaultCard.jsx";

import "./App.css";

export default function App() {
  // =====================================================================
  // WALLET STATE
  // =====================================================================

  /**
   * account:
   *  The connected wallet address from MetaMask.
   *  Starts as null until the user connects.
   */
  const [account, setAccount] = useState(null);

  // =====================================================================
  // CONTRACT STATE
  // =====================================================================

  /**
   * vaultBalance:
   *  The caller's ETH currently staked in the vault (string, in ETH units).
   */
  const [vaultBalance, setVaultBalance] = useState("0.0");

  /**
   * totalStaked:
   *  The total ETH locked in the vault by all users (string, in ETH units).
   */
  const [totalStaked, setTotalStaked] = useState("0.0");

  // =====================================================================
  // UI STATE
  // =====================================================================

  /**
   * isLoading:
   *  True while a transaction is in flight (deposit/withdraw),
   *  so we can disable buttons and prevent double-clicks.
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * status:
   *  Human-readable updates like "Connected", "Deposit complete", etc.
   */
  const [status, setStatus] = useState("");

  /**
   * error:
   *  Human-readable error messages when something fails.
   */
  const [error, setError] = useState("");


  // =====================================================================
  // 1. CONNECT WALLET
  // =====================================================================

  /**
   * connectWallet
   * -------------
   * Connects to MetaMask, loads the active account address,
   * and then refreshes balances for that account.
   */
  async function connectWallet() {
    try {
      setError("");
      setStatus("Connecting...");

      // getProviderAndSigner gives us provider + signer from MetaMask
      const { signer } = await getProviderAndSigner();

      // signer.getAddress() returns the currently selected wallet address
      const addr = await signer.getAddress();

      setAccount(addr);
      setStatus(`Connected: ${addr.slice(0, 6)}...${addr.slice(-4)}`);

      // Load balances for this account after connecting
      await refreshBalances(addr);
    } catch (err) {
      console.error(err);
      setError(err.message || "Wallet connection failed");
      setStatus("");
    }
  }


  // =====================================================================
  // 2. READ BALANCES
  // =====================================================================

  /**
   * refreshBalances
   * ----------------
   * Reads:
   *  - the user's vault balance from the mapping
   *  - the total staked amount from the contract
   *
   * If optionalAddress is passed, use that.
   * Otherwise fall back to the currently connected account.
   */
  async function refreshBalances(optionalAddress) {
    try {
      setError("");

      const addr = optionalAddress || account;
      if (!addr) return; // nothing to do if we don't know who to read for

      // Read-only contract instance using provider
      const contract = await getVaultRead();

      // Read both values at the same time for performance
      const [myBalWei, totalWei] = await Promise.all([
        contract.balances(addr),
        contract.totalStaked(),
      ]);

      // Convert wei → ETH strings
      setVaultBalance(formatEther(myBalWei));
      setTotalStaked(formatEther(totalWei));

      setStatus("Balances updated.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to read balances");
    }
  }


  // =====================================================================
  // 3. WRITE: DEPOSIT 0.1 ETH
  // =====================================================================

  /**
   * deposit
   * -------
   * Sends a transaction to deposit exactly 0.1 ETH into the vault.
   * Uses a write-enabled contract instance with the signer.
   */
  async function deposit() {
    if (!account) {
      setError("Please connect your wallet first.");
      return;
    }

    try {
      setError("");
      setStatus("Depositing 0.1 ETH...");
      setIsLoading(true);

      // Write-enabled contract instance (uses signer)
      const contract = await getVaultWrite();

      // deposit() is payable: we attach 0.1 ETH as msg.value
      const tx = await contract.deposit({
        value: parseEther("0.1"),
      });

      // Wait for the transaction to be mined
      await tx.wait();

      setStatus("Deposit complete.");
      await refreshBalances();
    } catch (err) {
      console.error(err);
      setError(err.message || "Deposit failed.");
    } finally {
      setIsLoading(false);
    }
  }


  // =====================================================================
  // 4. WRITE: WITHDRAW 0.1 ETH
  // =====================================================================

  /**
   * withdraw
   * --------
   * Sends a transaction to withdraw 0.1 ETH from the vault.
   * Will revert if the user doesn't have enough staked.
   */
  async function withdraw() {
    if (!account) {
      setError("Please connect your wallet first.");
      return;
    }

    try {
      setError("");
      setStatus("Withdrawing 0.1 ETH...");
      setIsLoading(true);

      const contract = await getVaultWrite();

      // withdraw(amount) expects amount in wei
      const tx = await contract.withdraw(parseEther("0.1"));
      await tx.wait();

      setStatus("Withdraw complete.");
      await refreshBalances();
    } catch (err) {
      console.error(err);
      setError(err.message || "Withdraw failed.");
    } finally {
      setIsLoading(false);
    }
  }


  // =====================================================================
  // 5. UI LAYOUT
  // =====================================================================

  return (
    <div className="app-container">
      <div className="card">
        {/* Title */}
        <h1>Staking Vault</h1>

        {/* Short explanation */}
        <p className="subtitle">
          A simple ETH vault running on your local Hardhat blockchain.
        </p>

        {/* WALLET INFO + CONNECT BUTTON */}
        <div className="wallet-box">
          <div className="wallet-info">
            <div className="label">Connected wallet</div>
            <div className="value">
              {account
                ? `${account.slice(0, 6)}...${account.slice(-4)}`
                : "Not connected"}
            </div>
          </div>

          <button
            className="button green"
            onClick={connectWallet}
          >
            {account ? "Reconnect" : "Connect Wallet"}
          </button>
        </div>

        {/* DISPLAY BALANCES USING VaultCard COMPONENT */}
        <VaultCard
          vaultBalance={vaultBalance}
          totalStaked={totalStaked}
        />

        {/* ACTION BUTTONS: DEPOSIT + WITHDRAW */}
        <div className="actions-row">
          <button
            className="button green"
            onClick={deposit}
            disabled={isLoading}
          >
            Deposit 0.1 ETH
          </button>

          <button
            className="button orange-outline"
            onClick={withdraw}
            disabled={isLoading}
          >
            Withdraw 0.1 ETH
          </button>
        </div>

        {/* MANUAL REFRESH BUTTON */}
        <button
          className="button gray"
          onClick={() => refreshBalances()}
          disabled={!account || isLoading}
        >
          Refresh balances
        </button>

        {/* STATUS + ERROR MESSAGES */}
        {status && <div className="status">{status}</div>}
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
