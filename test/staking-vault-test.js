// Import assertion helpers from Chai
// We'll use `expect(...)` for our test assertions.
import { expect } from "chai";

// Import the full Hardhat Runtime Environment (HRE).
// In Hardhat 3, we get ethers from `hre.network.connect()`.
import hre from "hardhat";

// ✅ Hardhat 3 pattern: connect to the network *once* at the top level.
// This gives us an `ethers` instance wired to Hardhat's simulated chain.
const { ethers } = await hre.network.connect();

// Test suite for the StakingVault contract.
describe("StakingVault", function () {
  // We'll store references to:
  // - vault: the deployed StakingVault contract
  // - owner, addr1: example accounts/signers for our tests
  let vault;
  let owner;
  let addr1;

  // Runs BEFORE each test.
  // We deploy a FRESH contract every time so tests are isolated.
  beforeEach(async function () {
    // Get some test accounts from Hardhat's local network.
    // These are pre-funded signers we can use in our tests.
    const signers = await ethers.getSigners();
    owner = signers[0];
    addr1 = signers[1];

    // Deploy a new instance of the StakingVault contract.
    //
    // `deployContract("StakingVault")` looks up the compiled artifact by name
    // and deploys it to the in-memory Hardhat network.
    vault = await ethers.deployContract("StakingVault");

    // Wait until the deployment transaction is mined and the contract is ready.
    await vault.waitForDeployment();
  });

  // -----------------------------
  // TEST 1: Deposit ETH
  // -----------------------------
  it("allows users to deposit ETH", async function () {
    // Convert "1" ETH into wei (the smallest ETH unit).
    // ethers.parseEther("1") returns a BigInt representing 1 ETH in wei.
    const depositAmount = ethers.parseEther("1");

    // Call deposit() as addr1, sending along 1 ETH.
    //
    // `connect(addr1)` tells ethers "send this transaction FROM addr1".
    await vault.connect(addr1).deposit({ value: depositAmount });

    // Check that the balance in the contract mapping matches 1 ETH.
    //
    // We read the public `balances` mapping from the contract and expect it
    // to equal the amount we deposited.
    const balance = await vault.balances(addr1.address);
    expect(balance).to.equal(depositAmount);
  });

  // -----------------------------
  // TEST 2: Withdraw ETH
  // -----------------------------
  it("allows users to withdraw ETH", async function () {
    // Same deposit amount as before: 1 ETH.
    const depositAmount = ethers.parseEther("1");

    // First, addr1 deposits 1 ETH into the vault.
    await vault.connect(addr1).deposit({ value: depositAmount });

    // Then, addr1 withdraws the same amount.
    await vault.connect(addr1).withdraw(depositAmount);

    // After withdrawing, the vault balance for addr1 should be 0.
    //
    // Note: `0n` is the BigInt literal for zero, which matches
    // the type returned from the contract.
    const balance = await vault.balances(addr1.address);
    expect(balance).to.equal(0n);
  });

  // -----------------------------
  // TEST 3: Over-withdrawal fails
  // -----------------------------
  it("reverts when withdrawing more than balance", async function () {
    // We'll try to withdraw 1 ETH without ever depositing.
    const amount = ethers.parseEther("1");

    // addr1 never deposited, so their vault balance is 0.
    // Trying to withdraw 1 ETH should cause a revert in the contract.
    let failed = false;

    try {
      await vault.connect(addr1).withdraw(amount);
    } catch (err) {
      failed = true;

      // Optional check: ensure the revert message matches our require().
      //
      // Some environments stringify errors in slightly different ways,
      // so instead of checking for an exact string match, we just verify
      // that the message *includes* our error text.
      expect(String(err.message)).to.include("Not enough balance");
    }

    // Make sure we DID hit the revert path at least once.
    expect(failed).to.equal(true);
  });

  // -----------------------------
  // TEST 4: myBalance helper
  // -----------------------------

  it("returns the correct myBalance for the caller", async function () {
    //we'll deposit 0.5 ETH from addr1.
    const depositAmount = ethers.parseEther("0.5");

    //addr1 sends .5 ETH into the vault.
    await vault.connect(addr1).deposit({ value: depositAmount });

    //Read the balance two ways:
    //1) Directly from the public mapping
    const direct = await vault.balances(addr1.address);

    //2) Using the convenience helper, but called *as addr1*
    const viaHelper = await vault.connect(addr1).myBalance();

    //Both values should be identical
    expect(viaHelper).to.equal(direct);
  })

  // -----------------------------
  // TEST 5: Deposited event
  // -----------------------------
  it("emits a Deposited event when ETH is deposited", async function () {
    // We'll deposit 1 ETH from addr1.
    const depositAmount = ethers.parseEther("1");

    // Perform the deposit transaction.
    const tx = await vault.connect(addr1).deposit({ value: depositAmount });

    // Wait for the transaction to be mined so we can inspect its logs.
    const receipt = await tx.wait();

    // Look through all logs for our Deposited event.
    //
    // In ethers v6 with Hardhat, the contract object has an `interface`
    // that can parse logs based on the ABI.
    const logs = receipt.logs
      .map((log) => {
        try {
          return vault.interface.parseLog(log);
        } catch {
          // Not an event from StakingVault → ignore
          return null;
        }
      })
      .filter((parsed) => parsed !== null);

    // Find the first Deposited event in the parsed logs.
    const depositedEvent = logs.find(
      (ev) => ev.name === "Deposited"
    );

    // Make sure we actually found it.
    expect(depositedEvent).to.not.equal(undefined);

    // The event has a `args` object with our parameters.
    const { user, amount } = depositedEvent.args;

    // Check that the event parameters match what we expect:
    // - user should be addr1
    // - amount should be the ETH we deposited
    expect(user).to.equal(addr1.address);
    expect(amount).to.equal(depositAmount);
  });

});
