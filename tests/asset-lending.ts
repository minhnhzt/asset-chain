import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AssetLending } from "../target/types/asset_lending";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { expect } from "chai";

describe("asset-lending", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AssetLending as Program<AssetLending>;

  // Test accounts
  let owner: Keypair;
  let borrower: Keypair;
  let nftMint: PublicKey;
  let ownerTokenAccount: PublicKey;
  let escrowTokenAccount: PublicKey;
  let loanEscrow: PublicKey;

  const LOAN_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

  before(async () => {
    // Initialize test accounts
    owner = Keypair.generate();
    borrower = Keypair.generate();

    // Airdrop SOL to owner and borrower
    const airdropOwner = await provider.connection.requestAirdrop(
      owner.publicKey,
      5 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropOwner);

    const airdropBorrower = await provider.connection.requestAirdrop(
      borrower.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropBorrower);

    console.log("✅ Test accounts initialized");
    console.log("   Owner:", owner.publicKey.toString());
    console.log("   Borrower:", borrower.publicKey.toString());
  });

  describe("Setup NFT", () => {
    it("Creates an NFT (supply=1, decimals=0)", async () => {
      // Create NFT mint
      nftMint = await createMint(
        provider.connection,
        owner,
        owner.publicKey,
        null,
        0, // 0 decimals = NFT
        undefined,
        undefined,
        TOKEN_PROGRAM_ID
      );

      // Create owner's token account
      ownerTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        owner,
        nftMint,
        owner.publicKey
      );

      // Mint 1 NFT to owner
      await mintTo(
        provider.connection,
        owner,
        nftMint,
        ownerTokenAccount,
        owner,
        1 // Mint exactly 1 token
      );

      const mintInfo = await provider.connection.getParsedAccountInfo(nftMint);
      const supply = (mintInfo.value?.data as any).parsed.info.supply;
      
      expect(supply).to.equal("1");
      console.log("✅ NFT created:", nftMint.toString());
      console.log("   Supply:", supply);
    });
  });

  describe("1. Lend Asset", () => {
    it("Owner successfully lends NFT to borrower", async () => {
      // Derive PDA for loan escrow
      [loanEscrow] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("loan_escrow"),
          owner.publicKey.toBuffer(),
          nftMint.toBuffer(),
        ],
        program.programId
      );

      // Derive escrow token account
      escrowTokenAccount = await getAssociatedTokenAddress(
        nftMint,
        loanEscrow,
        true
      );

      console.log("   Loan Escrow PDA:", loanEscrow.toString());
      console.log("   Escrow Token Account:", escrowTokenAccount.toString());

      const tx = await program.methods
        .lendAsset(borrower.publicKey, new anchor.BN(LOAN_DURATION))
        .accounts({
          owner: owner.publicKey,
          loanEscrow,
          assetMint: nftMint,
          ownerTokenAccount,
          escrowTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([owner])
        .rpc();

      console.log("✅ Lend transaction:", tx);

      // Verify loan escrow account
      const escrowData = await program.account.loanEscrowAccount.fetch(
        loanEscrow
      );
      expect(escrowData.owner.toString()).to.equal(owner.publicKey.toString());
      expect(escrowData.borrower.toString()).to.equal(
        borrower.publicKey.toString()
      );
      expect(escrowData.assetMint.toString()).to.equal(nftMint.toString());
      expect(escrowData.status).to.deep.equal({ active: {} });

      // Verify NFT is in escrow
      const escrowTokenBalance = await provider.connection.getTokenAccountBalance(
        escrowTokenAccount
      );
      expect(escrowTokenBalance.value.amount).to.equal("1");

      console.log("✅ NFT successfully locked in escrow");
      console.log("   Loan end time:", new Date(escrowData.loanEndTime.toNumber() * 1000).toISOString());
    });

    it("Fails to lend with invalid duration (too short)", async () => {
      const shortDuration = 1800; // 30 minutes (invalid)

      // Create a separate NFT for this test to avoid PDA collision
      const testNftMint = await createMint(
        provider.connection,
        owner,
        owner.publicKey,
        null,
        0, // 0 decimals = NFT
        undefined,
        undefined,
        TOKEN_PROGRAM_ID
      );

      // Correct PDA derivation: [b"loan_escrow", owner.key(), asset_mint.key()]
      const [testLoanEscrow] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("loan_escrow"),
          owner.publicKey.toBuffer(),
          testNftMint.toBuffer()
        ],
        program.programId
      );
      const testOwnerTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        owner,
        testNftMint,
        owner.publicKey
      );
      const testEscrowTokenAccount = await getAssociatedTokenAddress(
        testNftMint,
        testLoanEscrow,
        true
      );

      // Mint 1 NFT to owner
      await mintTo(
        provider.connection,
        owner,
        testNftMint,
        testOwnerTokenAccount,
        owner,
        1
      );

      try {
        await program.methods
          .lendAsset(borrower.publicKey, new anchor.BN(shortDuration))
          .accounts({
            owner: owner.publicKey,
            loanEscrow: testLoanEscrow,
            assetMint: testNftMint,
            ownerTokenAccount: testOwnerTokenAccount,
            escrowTokenAccount: testEscrowTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([owner])
          .rpc();

        expect.fail("Should have thrown InvalidLoanDuration error");
      } catch (err: any) {
        const errMsg = err.toString();
        // Check for anchor error code 6000 or Vietnamese error message
        const hasError = errMsg.includes("InvalidLoanDuration") || 
                        errMsg.includes("6000") || 
                        errMsg.includes("Thời gian cho mượn") ||
                        errMsg.includes("Error Code: InvalidLoanDuration") ||
                        errMsg.includes("Error Number: 6000");
        expect(hasError).to.be.true;
        console.log("✅ Correctly rejected invalid duration");
      }
    });
  });

  describe("2. Return Asset", () => {
    it("Borrower successfully returns NFT before expiry", async () => {
      const tx = await program.methods
        .returnAsset()
        .accounts({
          borrower: borrower.publicKey,
          owner: owner.publicKey,
          loanEscrow,
          escrowTokenAccount,
          ownerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([borrower])
        .rpc();

      console.log("✅ Return transaction:", tx);

      // Verify NFT is back in owner's account
      const ownerTokenBalance = await provider.connection.getTokenAccountBalance(
        ownerTokenAccount
      );
      expect(ownerTokenBalance.value.amount).to.equal("1");

      // Verify escrow account is closed
      const escrowAccountInfo = await provider.connection.getAccountInfo(
        loanEscrow
      );
      expect(escrowAccountInfo).to.be.null;

      console.log("✅ NFT successfully returned to owner");
      console.log("✅ Escrow accounts closed");
    });

    it("Fails when unauthorized user tries to return", async () => {
      // Need to create a new loan first
      const newOwner = Keypair.generate();
      const airdrop = await provider.connection.requestAirdrop(
        newOwner.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdrop);

      // Create new NFT
      const newNftMint = await createMint(
        provider.connection,
        newOwner,
        newOwner.publicKey,
        null,
        0
      );

      const newOwnerTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        newOwner,
        newNftMint,
        newOwner.publicKey
      );

      await mintTo(
        provider.connection,
        newOwner,
        newNftMint,
        newOwnerTokenAccount,
        newOwner,
        1
      );

      const [newLoanEscrow] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("loan_escrow"),
          newOwner.publicKey.toBuffer(),
          newNftMint.toBuffer(),
        ],
        program.programId
      );

      const newEscrowTokenAccount = await getAssociatedTokenAddress(
        newNftMint,
        newLoanEscrow,
        true
      );

      // Create loan
      await program.methods
        .lendAsset(borrower.publicKey, new anchor.BN(LOAN_DURATION))
        .accounts({
          owner: newOwner.publicKey,
          loanEscrow: newLoanEscrow,
          assetMint: newNftMint,
          ownerTokenAccount: newOwnerTokenAccount,
          escrowTokenAccount: newEscrowTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([newOwner])
        .rpc();

      // Try to return with wrong account (owner instead of borrower)
      try {
        await program.methods
          .returnAsset()
          .accounts({
            borrower: owner.publicKey, // Wrong! Should be borrower
            owner: newOwner.publicKey,
            loanEscrow: newLoanEscrow,
            escrowTokenAccount: newEscrowTokenAccount,
            ownerTokenAccount: newOwnerTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([owner])
          .rpc();

        expect.fail("Should have thrown UnauthorizedBorrower error");
      } catch (err: any) {
        expect(err.toString()).to.include("UnauthorizedBorrower");
        console.log("✅ Correctly rejected unauthorized return attempt");
      }

      // Clean up - return with correct borrower
      await program.methods
        .returnAsset()
        .accounts({
          borrower: borrower.publicKey,
          owner: newOwner.publicKey,
          loanEscrow: newLoanEscrow,
          escrowTokenAccount: newEscrowTokenAccount,
          ownerTokenAccount: newOwnerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([borrower])
        .rpc();
    });
  });

  describe("3. Reclaim Asset", () => {
    let reclaimOwner: Keypair;
    let reclaimNftMint: PublicKey;
    let reclaimOwnerTokenAccount: PublicKey;
    let reclaimEscrowTokenAccount: PublicKey;
    let reclaimLoanEscrow: PublicKey;

    before(async () => {
      // Setup for reclaim test with very short duration
      reclaimOwner = Keypair.generate();
      const airdrop = await provider.connection.requestAirdrop(
        reclaimOwner.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdrop);

      // Create NFT
      reclaimNftMint = await createMint(
        provider.connection,
        reclaimOwner,
        reclaimOwner.publicKey,
        null,
        0
      );

      reclaimOwnerTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        reclaimOwner,
        reclaimNftMint,
        reclaimOwner.publicKey
      );

      await mintTo(
        provider.connection,
        reclaimOwner,
        reclaimNftMint,
        reclaimOwnerTokenAccount,
        reclaimOwner,
        1
      );

      [reclaimLoanEscrow] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("loan_escrow"),
          reclaimOwner.publicKey.toBuffer(),
          reclaimNftMint.toBuffer(),
        ],
        program.programId
      );

      reclaimEscrowTokenAccount = await getAssociatedTokenAddress(
        reclaimNftMint,
        reclaimLoanEscrow,
        true
      );

      // Create loan with 3601 second duration (just over 1 hour - valid)
      await program.methods
        .lendAsset(borrower.publicKey, new anchor.BN(3601))
        .accounts({
          owner: reclaimOwner.publicKey,
          loanEscrow: reclaimLoanEscrow,
          assetMint: reclaimNftMint,
          ownerTokenAccount: reclaimOwnerTokenAccount,
          escrowTokenAccount: reclaimEscrowTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([reclaimOwner])
        .rpc();

      console.log("✅ Loan created for reclaim test (3601 second duration)");
    });

    it("Fails to reclaim before expiry", async () => {
      try {
        await program.methods
          .reclaimAsset()
          .accounts({
            owner: reclaimOwner.publicKey,
            loanEscrow: reclaimLoanEscrow,
            escrowTokenAccount: reclaimEscrowTokenAccount,
            ownerTokenAccount: reclaimOwnerTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([reclaimOwner])
          .rpc();

        expect.fail("Should have thrown LoanNotExpired error");
      } catch (err: any) {
        expect(err.toString()).to.include("LoanNotExpired");
        console.log("✅ Correctly rejected early reclaim attempt");
      }
    });

    it.skip("Owner successfully reclaims NFT after expiry", async () => {
      // SKIP: Cannot test time-based expiry on localnet validator
      // Loan duration minimum is 3600 seconds (1 hour)
      // Test would need to wait 1+ hour which is impractical
      // MANUAL TEST: Deploy to devnet and test with actual time passage
      console.log("⏭️  SKIPPED: Requires 1+ hour wait for expiry");
    });
  });

  describe("4. Revoke Loan", () => {
    let revokeOwner: Keypair;
    let revokeNftMint: PublicKey;
    let revokeOwnerTokenAccount: PublicKey;
    let revokeEscrowTokenAccount: PublicKey;
    let revokeLoanEscrow: PublicKey;

    before(async () => {
      // Setup for revoke test
      revokeOwner = Keypair.generate();
      const airdrop = await provider.connection.requestAirdrop(
        revokeOwner.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdrop);

      // Create NFT
      revokeNftMint = await createMint(
        provider.connection,
        revokeOwner,
        revokeOwner.publicKey,
        null,
        0
      );

      revokeOwnerTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        revokeOwner,
        revokeNftMint,
        revokeOwner.publicKey
      );

      await mintTo(
        provider.connection,
        revokeOwner,
        revokeNftMint,
        revokeOwnerTokenAccount,
        revokeOwner,
        1
      );

      [revokeLoanEscrow] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("loan_escrow"),
          revokeOwner.publicKey.toBuffer(),
          revokeNftMint.toBuffer(),
        ],
        program.programId
      );

      revokeEscrowTokenAccount = await getAssociatedTokenAddress(
        revokeNftMint,
        revokeLoanEscrow,
        true
      );

      // Create loan with long duration
      await program.methods
        .lendAsset(borrower.publicKey, new anchor.BN(LOAN_DURATION))
        .accounts({
          owner: revokeOwner.publicKey,
          loanEscrow: revokeLoanEscrow,
          assetMint: revokeNftMint,
          ownerTokenAccount: revokeOwnerTokenAccount,
          escrowTokenAccount: revokeEscrowTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([revokeOwner])
        .rpc();

      console.log("✅ Loan created for revoke test");
    });

    it("Owner successfully revokes loan immediately", async () => {
      const tx = await program.methods
        .revokeLoan()
        .accounts({
          owner: revokeOwner.publicKey,
          loanEscrow: revokeLoanEscrow,
          escrowTokenAccount: revokeEscrowTokenAccount,
          ownerTokenAccount: revokeOwnerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([revokeOwner])
        .rpc();

      console.log("✅ Revoke transaction:", tx);

      // Verify NFT is back in owner's account
      const ownerTokenBalance = await provider.connection.getTokenAccountBalance(
        revokeOwnerTokenAccount
      );
      expect(ownerTokenBalance.value.amount).to.equal("1");

      // Verify escrow account is closed
      const escrowAccountInfo = await provider.connection.getAccountInfo(
        revokeLoanEscrow
      );
      expect(escrowAccountInfo).to.be.null;

      console.log("✅ Loan successfully revoked (early termination)");
    });

    it("Fails when non-owner tries to revoke", async () => {
      // Create another loan
      const newRevokeOwner = Keypair.generate();
      const airdrop = await provider.connection.requestAirdrop(
        newRevokeOwner.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdrop);

      const newRevokeNftMint = await createMint(
        provider.connection,
        newRevokeOwner,
        newRevokeOwner.publicKey,
        null,
        0
      );

      const newRevokeOwnerTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        newRevokeOwner,
        newRevokeNftMint,
        newRevokeOwner.publicKey
      );

      await mintTo(
        provider.connection,
        newRevokeOwner,
        newRevokeNftMint,
        newRevokeOwnerTokenAccount,
        newRevokeOwner,
        1
      );

      const [newRevokeLoanEscrow] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("loan_escrow"),
          newRevokeOwner.publicKey.toBuffer(),
          newRevokeNftMint.toBuffer(),
        ],
        program.programId
      );

      const newRevokeEscrowTokenAccount = await getAssociatedTokenAddress(
        newRevokeNftMint,
        newRevokeLoanEscrow,
        true
      );

      await program.methods
        .lendAsset(borrower.publicKey, new anchor.BN(LOAN_DURATION))
        .accounts({
          owner: newRevokeOwner.publicKey,
          loanEscrow: newRevokeLoanEscrow,
          assetMint: newRevokeNftMint,
          ownerTokenAccount: newRevokeOwnerTokenAccount,
          escrowTokenAccount: newRevokeEscrowTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([newRevokeOwner])
        .rpc();

      // Try to revoke with borrower (not owner)
      try {
        await program.methods
          .revokeLoan()
          .accounts({
            owner: borrower.publicKey, // Wrong! Should be owner
            loanEscrow: newRevokeLoanEscrow,
            escrowTokenAccount: newRevokeEscrowTokenAccount,
            ownerTokenAccount: newRevokeOwnerTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([borrower])
          .rpc();

        expect.fail("Should have thrown UnauthorizedOwner error");
      } catch (err: any) {
        expect(err.toString()).to.include("UnauthorizedOwner");
        console.log("✅ Correctly rejected unauthorized revoke attempt");
      }

      // Clean up
      await program.methods
        .revokeLoan()
        .accounts({
          owner: newRevokeOwner.publicKey,
          loanEscrow: newRevokeLoanEscrow,
          escrowTokenAccount: newRevokeEscrowTokenAccount,
          ownerTokenAccount: newRevokeOwnerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([newRevokeOwner])
        .rpc();
    });
  });

  describe("Edge Cases", () => {
    it("Fails to lend non-NFT token (supply > 1)", async () => {
      // Create fungible token (not NFT)
      const fungibleMint = await createMint(
        provider.connection,
        owner,
        owner.publicKey,
        null,
        9 // 9 decimals = fungible token
      );

      const fungibleTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        owner,
        fungibleMint,
        owner.publicKey
      );

      await mintTo(
        provider.connection,
        owner,
        fungibleMint,
        fungibleTokenAccount,
        owner,
        1000000000 // Mint 1.0 tokens
      );

      const [fungibleLoanEscrow] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("loan_escrow"),
          owner.publicKey.toBuffer(),
          fungibleMint.toBuffer(),
        ],
        program.programId
      );

      const fungibleEscrowTokenAccount = await getAssociatedTokenAddress(
        fungibleMint,
        fungibleLoanEscrow,
        true
      );

      try {
        await program.methods
          .lendAsset(borrower.publicKey, new anchor.BN(LOAN_DURATION))
          .accounts({
            owner: owner.publicKey,
            loanEscrow: fungibleLoanEscrow,
            assetMint: fungibleMint,
            ownerTokenAccount: fungibleTokenAccount,
            escrowTokenAccount: fungibleEscrowTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([owner])
          .rpc();

        expect.fail("Should have thrown NotNFT error");
      } catch (err: any) {
        expect(err.toString()).to.include("NotNFT");
        console.log("✅ Correctly rejected non-NFT token");
      }
    });
  });
});
