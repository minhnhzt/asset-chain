/**
 * Blockchain Utility Functions
 * Helper functions for interacting with Solana programs
 */

import { Connection, PublicKey, Transaction, Commitment } from '@solana/web3.js';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { SOLANA_CONFIG } from '../config/solana';

// Import IDLs
import AssetManagerIDL from '../../target/idl/asset_manager.json';
import AssetRegistryIDL from '../../target/idl/asset_registry.json';

/**
 * Create a connection to the Solana network
 */
export function createConnection(commitment: Commitment = 'confirmed'): Connection {
  return new Connection(SOLANA_CONFIG.rpcUrl, commitment);
}

/**
 * Get the Asset Manager program
 */
export function getAssetManagerProgram(provider: AnchorProvider) {
  const programId = new PublicKey(SOLANA_CONFIG.programs.assetManager);
  return new Program(AssetManagerIDL as Idl, provider);
}

/**
 * Get the Asset Registry program
 */
export function getAssetRegistryProgram(provider: AnchorProvider) {
  const programId = new PublicKey(SOLANA_CONFIG.programs.assetRegistry);
  return new Program(AssetRegistryIDL as Idl, provider);
}

/**
 * Derive Asset PDA for Asset Registry
 */
export async function deriveAssetPDA(
  owner: PublicKey,
  assetName: string
): Promise<[PublicKey, number]> {
  const programId = new PublicKey(SOLANA_CONFIG.programs.assetRegistry);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('asset'),
      owner.toBuffer(),
      Buffer.from(assetName),
    ],
    programId
  );
}

/**
 * Derive Maintenance Log PDA for Asset Registry
 */
export async function deriveMaintenanceLogPDA(
  assetPda: PublicKey
): Promise<[PublicKey, number]> {
  const programId = new PublicKey(SOLANA_CONFIG.programs.assetRegistry);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('maintenance_log'),
      assetPda.toBuffer(),
    ],
    programId
  );
}

/**
 * Confirm transaction with proper error handling
 */
export async function confirmTransaction(
  connection: Connection,
  signature: string,
  commitment: Commitment = 'confirmed'
): Promise<void> {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  
  const confirmation = await connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight,
  }, commitment);

  if (confirmation.value.err) {
    throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
  }

  if (SOLANA_CONFIG.debug.showTransactionLogs) {
    console.log('✅ Transaction confirmed:', signature);
  }
}

/**
 * Get transaction logs for debugging
 */
export async function getTransactionLogs(
  connection: Connection,
  signature: string
): Promise<string[] | null> {
  const tx = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  });
  
  return tx?.meta?.logMessages || null;
}

/**
 * Format status enum from on-chain data
 */
export function formatAssetStatus(status: unknown): string {
  const statusObj = status as Record<string, unknown>;
  if (statusObj.active !== undefined) return 'Active';
  if (statusObj.maintenance !== undefined) return 'Maintenance';
  if (statusObj.retired !== undefined) return 'Retired';
  if (statusObj.disposed !== undefined) return 'Disposed';
  return 'Unknown';
}

/**
 * Parse asset status to enum value
 */
export function parseAssetStatus(statusString: string): number {
  const statusMap: { [key: string]: number } = {
    'active': 0,
    'maintenance': 1,
    'retired': 2,
    'disposed': 3,
  };
  return statusMap[statusString.toLowerCase()] ?? 0;
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format SOL amount
 */
export function formatSOL(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(4);
}

/**
 * Log blockchain operation
 */
export function logBlockchainOp(operation: string, details: unknown) {
  if (SOLANA_CONFIG.debug.enabled) {
    console.log(`⛓️  [Blockchain] ${operation}:`, details);
  }
}
