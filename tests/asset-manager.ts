import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AssetManager } from "../target/types/asset_manager";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram,
  SYSVAR_RENT_PUBKEY 
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { expect } from "chai";

describe("Asset Manager", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AssetManager as Program<AssetManager>;
  
  // Test accounts
  let assetManagerPda: PublicKey;
  let assetManagerBump: number;
  let authority: Keypair;
  let assetOwner: Keypair;
  let mintKeypair: Keypair;
  let assetAccountPda: PublicKey;
  let assetAccountBump: number;
  let maintenanceLogPda: PublicKey;
  let maintenanceLogBump: number;
  let tokenAccount: PublicKey;

  before(async () => {
    // Initialize test accounts
    authority = Keypair.generate();
    assetOwner = Keypair.generate();
    mintKeypair = Keypair.generate();

    // Airdrop SOL to test accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(authority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(assetOwner.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );

    // Derive PDAs
    [assetManagerPda, assetManagerBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("asset_manager")],
      program.programId
    );

    [assetAccountPda, assetAccountBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("asset"), mintKeypair.publicKey.toBuffer()],
      program.programId
    );

    [maintenanceLogPda, maintenanceLogBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("maintenance_log"), assetAccountPda.toBuffer()],
      program.programId
    );

    // Get associated token account
    tokenAccount = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      assetOwner.publicKey
    );
  });

  it("Initializes the asset manager", async () => {
    try {
      // Check if already initialized
      try {
        const account = await program.account.assetManager.fetch(assetManagerPda);
        console.log("Asset Manager already initialized, skipping...");
        return; // Skip if already exists
      } catch (err) {
        // Account doesn't exist, proceed with initialization
      }

      const tx = await program.methods
        .initializeAssetManager()
        .accounts({
          assetManager: assetManagerPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      console.log("Initialize Asset Manager transaction signature:", tx);

      // Fetch the account and verify initialization
      const assetManagerAccount = await program.account.assetManager.fetch(assetManagerPda);
      expect(assetManagerAccount.authority.toString()).to.equal(authority.publicKey.toString());
      expect(assetManagerAccount.totalAssets.toString()).to.equal("0");
    } catch (error) {
      console.error("Error initializing asset manager:", error);
      throw error;
    }
  });

  it("Creates a new asset", async () => {
    const metadataCid = "QmTestCID1234567890abcdef";

    try {
      // Get current asset count before creation
      const assetManagerBefore = await program.account.assetManager.fetch(assetManagerPda);
      const countBefore = assetManagerBefore.totalAssets.toNumber();

      const tx = await program.methods
        .createAsset(metadataCid, 0) // 0 decimals for NFT-style token
        .accounts({
          assetAccount: assetAccountPda,
          assetManager: assetManagerPda,
          mint: mintKeypair.publicKey,
          tokenAccount: tokenAccount,
          owner: assetOwner.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([assetOwner, mintKeypair])
        .rpc();

      console.log("Create Asset transaction signature:", tx);

      // Verify asset account creation
      const assetAccount = await program.account.assetAccount.fetch(assetAccountPda);
      expect(assetAccount.owner.toString()).to.equal(assetOwner.publicKey.toString());
      expect(assetAccount.mint.toString()).to.equal(mintKeypair.publicKey.toString());
      expect(assetAccount.metadataCid).to.equal(metadataCid);
      expect(assetAccount.status).to.equal(0); // ACTIVE

      // Verify total assets incremented by 1
      const assetManagerAfter = await program.account.assetManager.fetch(assetManagerPda);
      const countAfter = assetManagerAfter.totalAssets.toNumber();
      expect(countAfter).to.equal(countBefore + 1);
      console.log(`✅ Total assets: ${countBefore} → ${countAfter}`);
    } catch (error) {
      console.error("Error creating asset:", error);
      throw error;
    }
  });

  it("Initializes maintenance log", async () => {
    try {
      const tx = await program.methods
        .initializeMaintenanceLog()
        .accounts({
          maintenanceLog: maintenanceLogPda,
          assetAccount: assetAccountPda,
          payer: assetOwner.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([assetOwner])
        .rpc();

      console.log("Initialize Maintenance Log transaction signature:", tx);

      // Verify maintenance log creation
      const maintenanceLog = await program.account.maintenanceLog.fetch(maintenanceLogPda);
      expect(maintenanceLog.asset.toString()).to.equal(assetAccountPda.toString());
      expect(maintenanceLog.logs).to.have.length(0);
    } catch (error) {
      console.error("Error initializing maintenance log:", error);
      throw error;
    }
  });

  it("Adds maintenance log entry", async () => {
    const action = "Routine Inspection";
    const detailsCid = "QmMaintenanceDetails123456789";

    try {
      const tx = await program.methods
        .addMaintenanceLog(action, detailsCid)
        .accounts({
          maintenanceLog: maintenanceLogPda,
          assetAccount: assetAccountPda,
          performer: assetOwner.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([assetOwner])
        .rpc();

      console.log("Add Maintenance Log transaction signature:", tx);

      // Verify maintenance log entry
      const maintenanceLog = await program.account.maintenanceLog.fetch(maintenanceLogPda);
      expect(maintenanceLog.logs).to.have.length(1);
      expect(maintenanceLog.logs[0].action).to.equal(action);
      expect(maintenanceLog.logs[0].detailsCid).to.equal(detailsCid);
      expect(maintenanceLog.logs[0].performer.toString()).to.equal(assetOwner.publicKey.toString());
    } catch (error) {
      console.error("Error adding maintenance log:", error);
      throw error;
    }
  });

  it("Updates asset metadata and status", async () => {
    const newMetadataCid = "QmUpdatedCID987654321fedcba";
    const newStatus = 1; // MAINTENANCE

    try {
      const tx = await program.methods
        .updateAsset(newMetadataCid, newStatus)
        .accounts({
          assetAccount: assetAccountPda,
          owner: assetOwner.publicKey,
        })
        .signers([assetOwner])
        .rpc();

      console.log("Update Asset transaction signature:", tx);

      // Verify asset update
      const assetAccount = await program.account.assetAccount.fetch(assetAccountPda);
      expect(assetAccount.metadataCid).to.equal(newMetadataCid);
      expect(assetAccount.status).to.equal(newStatus);
    } catch (error) {
      console.error("Error updating asset:", error);
      throw error;
    }
  });

  it("Retires an asset", async () => {
    try {
      const tx = await program.methods
        .retireAsset()
        .accounts({
          assetAccount: assetAccountPda,
          mint: mintKeypair.publicKey,
          tokenAccount: tokenAccount,
          owner: assetOwner.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([assetOwner])
        .rpc();

      console.log("Retire Asset transaction signature:", tx);

      // Verify asset retirement
      const assetAccount = await program.account.assetAccount.fetch(assetAccountPda);
      expect(assetAccount.status).to.equal(2); // RETIRED

      // Verify token was burned (balance should be 0)
      const tokenAccountInfo = await provider.connection.getTokenAccountBalance(tokenAccount);
      expect(tokenAccountInfo.value.amount).to.equal("0");
    } catch (error) {
      console.error("Error retiring asset:", error);
      throw error;
    }
  });

  it("Fails to update asset with unauthorized signer", async () => {
    const unauthorizedUser = Keypair.generate();
    
    // Airdrop SOL to unauthorized user
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(unauthorizedUser.publicKey, anchor.web3.LAMPORTS_PER_SOL)
    );

    try {
      await program.methods
        .updateAsset("QmUnauthorized", 0)
        .accounts({
          assetAccount: assetAccountPda,
          owner: unauthorizedUser.publicKey,
        })
        .signers([unauthorizedUser])
        .rpc();
      
      // Should not reach this point
      expect.fail("Expected transaction to fail");
    } catch (error: any) {
      expect(error.message).to.include("UnauthorizedAccess");
    }
  });
});