import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AssetManager } from "../target/types/asset_manager";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";

/**
 * Initialization script for the Asset Manager program
 * Run this after deploying the program to initialize the global state
 */
async function initializeAssetManager() {
  // Configure the client to use the local cluster or your preferred network
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AssetManager as Program<AssetManager>;
  
  console.log("🚀 Initializing Asset Manager Program");
  console.log("Program ID:", program.programId.toString());
  console.log("Provider wallet:", provider.wallet.publicKey.toString());

  // Derive the asset manager PDA
  const [assetManagerPda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("asset_manager")],
    program.programId
  );

  console.log("Asset Manager PDA:", assetManagerPda.toString());

  try {
    // Check if already initialized
    try {
      const existingAccount = await program.account.assetManager.fetch(assetManagerPda);
      console.log("✅ Asset Manager already initialized!");
      console.log("Authority:", existingAccount.authority.toString());
      console.log("Total Assets:", existingAccount.totalAssets.toString());
      return;
    } catch (error) {
      // Account doesn't exist, proceed with initialization
      console.log("📝 Initializing new Asset Manager...");
    }

    // Initialize the asset manager
    const tx = await program.methods
      .initializeAssetManager()
      .accounts({
        assetManager: assetManagerPda,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Asset Manager initialized successfully!");
    console.log("Transaction signature:", tx);
    console.log("Authority:", provider.wallet.publicKey.toString());

    // Verify the initialization
    const assetManagerAccount = await program.account.assetManager.fetch(assetManagerPda);
    console.log("📊 Verification:");
    console.log("  - Authority:", assetManagerAccount.authority.toString());
    console.log("  - Total Assets:", assetManagerAccount.totalAssets.toString());
    console.log("  - Bump:", assetManagerAccount.bump[0]);

  } catch (error) {
    console.error("❌ Error initializing Asset Manager:", error);
    
    if (error.message?.includes("already in use")) {
      console.log("💡 The program might already be initialized. Check the account state.");
    }
    
    throw error;
  }
}

// Run the initialization
if (require.main === module) {
  initializeAssetManager()
    .then(() => {
      console.log("🎉 Initialization completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Initialization failed:", error);
      process.exit(1);
    });
}

export { initializeAssetManager };