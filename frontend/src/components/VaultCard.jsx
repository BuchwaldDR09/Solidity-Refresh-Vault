// src/components/VaultCard.jsx

/**
 * Displays:
 *  - the user's individual vault balance
 *  - the total staked amount across all users
 *
 * This is a "dumb" presentational component:
 *  - It receives values as props
 *  - It doesn't know anything about ethers or MetaMask
 */
export default function VaultCard({ vaultBalance, totalStaked }) {
  return (
    <div
      style={{
        marginBottom: "1.5rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.75rem",
      }}
    >
      {/* User's personal vault balance */}
      <div
        style={{
          padding: "0.9rem",
          borderRadius: "12px",
          background: "#1d2238",
        }}
      >
        <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
          Your vault balance
        </div>
        <div style={{ fontSize: "1.1rem", marginTop: "0.25rem" }}>
          {vaultBalance} ETH
        </div>
      </div>

      {/* Total staked by all users */}
      <div
        style={{
          padding: "0.9rem",
          borderRadius: "12px",
          background: "#1d2238",
        }}
      >
        <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
          Total staked (all users)
        </div>
        <div style={{ fontSize: "1.1rem", marginTop: "0.25rem" }}>
          {totalStaked} ETH
        </div>
      </div>
    </div>
  );
}
