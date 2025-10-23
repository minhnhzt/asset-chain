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

/**
 * Example client demonstrating how to interact with the Asset Manager program
 * This shows the complete asset lifecycle from creation to retirement
 */
class AssetManagerClient {
  private program: Program<AssetManager>;
  private provider: anchor.AnchorProvider;

  constructor(program: Program<AssetManager>, provider: anchor.AnchorProvider) {
    this.program = program;
    this.provider = provider;
  }

  /**
   * Create a new asset with metadata stored on IPFS
   */
  async createAsset(owner: Keypair, metadataCid: string): Promise<{
    assetAccount: PublicKey;
    mint: PublicKey;
    tokenAccount: PublicKey;
    signature: string;
  }> {
    console.log("🏭 Creating new asset...");
    
    // Generate mint keypair
    const mintKeypair = Keypair.generate();
    
    // Derive PDAs
    const [assetManagerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("asset_manager")],
      this.program.programId
    );

    const [assetAccountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("asset"), mintKeypair.publicKey.toBuffer()],
      this.program.programId
    );

    // Get associated token account
    const tokenAccount = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      owner.publicKey
    );

    const tx = await this.program.methods
      .createAsset(metadataCid, 0) // 0 decimals for NFT-style token
      .accounts({
        assetAccount: assetAccountPda,
        assetManager: assetManagerPda,
        mint: mintKeypair.publicKey,
        tokenAccount: tokenAccount,
        owner: owner.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([owner, mintKeypair])
      .rpc();

    console.log("✅ Asset created successfully!");
    console.log("  - Asset Account:", assetAccountPda.toString());
    console.log("  - Mint:", mintKeypair.publicKey.toString());
    console.log("  - Token Account:", tokenAccount.toString());
    console.log("  - Transaction:", tx);

    return {
      assetAccount: assetAccountPda,
      mint: mintKeypair.publicKey,
      tokenAccount,
      signature: tx,
    };
  }

  /**
   * Initialize maintenance log for an asset
   */
  async initializeMaintenanceLog(
    assetAccount: PublicKey,
    payer: Keypair
  ): Promise<{ maintenanceLog: PublicKey; signature: string }> {
    console.log("📋 Initializing maintenance log...");

    const [maintenanceLogPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("maintenance_log"), assetAccount.toBuffer()],
      this.program.programId
    );

    const tx = await this.program.methods
      .initializeMaintenanceLog()
      .accounts({
        maintenanceLog: maintenanceLogPda,
        assetAccount: assetAccount,
        payer: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([payer])
      .rpc();

    console.log("✅ Maintenance log initialized!");
    console.log("  - Maintenance Log:", maintenanceLogPda.toString());
    console.log("  - Transaction:", tx);

    return {
      maintenanceLog: maintenanceLogPda,
      signature: tx,
    };
  }

  /**
   * Add a maintenance log entry
   */
  async addMaintenanceLog(
    assetAccount: PublicKey,
    maintenanceLog: PublicKey,
    action: string,
    detailsCid: string,
    performer: Keypair
  ): Promise<string> {
    console.log("🔧 Adding maintenance log entry...");

    const tx = await this.program.methods
      .addMaintenanceLog(action, detailsCid)
      .accounts({
        maintenanceLog: maintenanceLog,
        assetAccount: assetAccount,
        performer: performer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([performer])
      .rpc();

    console.log("✅ Maintenance log entry added!");
    console.log("  - Action:", action);
    console.log("  - Details CID:", detailsCid);
    console.log("  - Transaction:", tx);

    return tx;
  }

  /**
   * Update asset metadata and status
   */
  async updateAsset(
    assetAccount: PublicKey,
    newMetadataCid: string,
    newStatus: number,
    owner: Keypair
  ): Promise<string> {
    console.log("📝 Updating asset...");

    const tx = await this.program.methods
      .updateAsset(newMetadataCid, newStatus)
      .accounts({
        assetAccount: assetAccount,
        owner: owner.publicKey,
      })
      .signers([owner])
      .rpc();

    console.log("✅ Asset updated!");
    console.log("  - New Metadata CID:", newMetadataCid);
    console.log("  - New Status:", newStatus);
    console.log("  - Transaction:", tx);

    return tx;
  }

  /**
   * Retire an asset (burn the token)
   */
  async retireAsset(
    assetAccount: PublicKey,
    mint: PublicKey,
    tokenAccount: PublicKey,
    owner: Keypair
  ): Promise<string> {
    console.log("🏁 Retiring asset...");

    const tx = await this.program.methods
      .retireAsset()
      .accounts({
        assetAccount: assetAccount,
        mint: mint,
        tokenAccount: tokenAccount,
        owner: owner.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([owner])
      .rpc();

    console.log("✅ Asset retired!");
    console.log("  - Transaction:", tx);

    return tx;
  }

  /**
   * Get asset account data
   */
  async getAsset(assetAccount: PublicKey) {
    const asset = await this.program.account.assetAccount.fetch(assetAccount);
    return asset;
  }

  /**
   * Get maintenance log data
   */
  async getMaintenanceLog(maintenanceLog: PublicKey) {
    const log = await this.program.account.maintenanceLog.fetch(maintenanceLog);
    return log;
  }

  /**
   * Get asset manager global state
   */
  async getAssetManager() {
    const [assetManagerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("asset_manager")],
      this.program.programId
    );
    
    const assetManager = await this.program.account.assetManager.fetch(assetManagerPda);
    return assetManager;
  }
}

/**
 * Example usage demonstrating the complete asset lifecycle
 */
async function exampleUsage() {
  console.log("🚀 Asset Manager Client Example");
  console.log("================================");

  // Setup
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.AssetManager as Program<AssetManager>;
  const client = new AssetManagerClient(program, provider);

  // Create test user
  const assetOwner = Keypair.generate();
  
  // Airdrop SOL to the test user
  const airdropTx = await provider.connection.requestAirdrop(
    assetOwner.publicKey,
    2 * anchor.web3.LAMPORTS_PER_SOL
  );
  await provider.connection.confirmTransaction(airdropTx);

  try {
    // 1. Create an asset
    const asset = await client.createAsset(
      assetOwner,
      "QmExampleAssetMetadata123456789abcdef"
    );

    // 2. Initialize maintenance log
    const maintenanceLogInfo = await client.initializeMaintenanceLog(
      asset.assetAccount,
      assetOwner
    );

    // 3. Add maintenance entries
    await client.addMaintenanceLog(
      asset.assetAccount,
      maintenanceLogInfo.maintenanceLog,
      "Initial Setup",
      "QmInitialSetupDetails123456789",
      assetOwner
    );

    await client.addMaintenanceLog(
      asset.assetAccount,
      maintenanceLogInfo.maintenanceLog,
      "Routine Inspection",
      "QmRoutineInspectionDetails456789",
      assetOwner
    );

    // 4. Update asset status to maintenance
    await client.updateAsset(
      asset.assetAccount,
      "QmUpdatedAssetMetadata987654321",
      1, // MAINTENANCE status
      assetOwner
    );

    // 5. Add maintenance completion log
    await client.addMaintenanceLog(
      asset.assetAccount,
      maintenanceLogInfo.maintenanceLog,
      "Maintenance Completed",
      "QmMaintenanceCompletedDetails789",
      assetOwner
    );

    // 6. Update asset back to active
    await client.updateAsset(
      asset.assetAccount,
      "QmUpdatedAssetMetadata987654321",
      0, // ACTIVE status
      assetOwner
    );

    // 7. Display final state
    console.log("\n📊 Final Asset State:");
    const finalAsset = await client.getAsset(asset.assetAccount);
    console.log("  - Owner:", finalAsset.owner.toString());
    console.log("  - Mint:", finalAsset.mint.toString());
    console.log("  - Status:", finalAsset.status);
    console.log("  - Metadata CID:", finalAsset.metadataCid);
    console.log("  - Created:", new Date(finalAsset.creationTime.toNumber() * 1000));
    console.log("  - Last Updated:", new Date(finalAsset.lastUpdate.toNumber() * 1000));

    const finalLog = await client.getMaintenanceLog(maintenanceLogInfo.maintenanceLog);
    console.log("  - Total Maintenance Entries:", finalLog.logs.length);

    // 8. Get global state
    const assetManager = await client.getAssetManager();
    console.log("  - Total Assets in System:", assetManager.totalAssets.toString());

    // 9. Finally, retire the asset
    await client.retireAsset(
      asset.assetAccount,
      asset.mint,
      asset.tokenAccount,
      assetOwner
    );

    console.log("\n🎉 Example completed successfully!");

  } catch (error) {
    console.error("❌ Error in example:", error);
    throw error;
  }
}

// Run the example if called directly
if (require.main === module) {
  exampleUsage()
    .then(() => {
      console.log("✅ All done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Example failed:", error);
      process.exit(1);
    });
}

export { AssetManagerClient, exampleUsage };