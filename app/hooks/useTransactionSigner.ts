'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, TransactionInstruction, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { SOLANA_CONFIG } from '@/app/config/solana';
import { confirmTransaction } from '@/app/lib/blockchain';
import AssetRegistryIDL from '../../target/idl/asset_registry.json';

/**
 * Hook for signing and sending Solana transactions
 * 
 * Provides utilities for:
 * - Building transactions from instructions
 * - Signing with connected wallet
 * - Sending and confirming transactions
 * - Error handling
 * 
 * Usage:
 * const { signAndSendTransaction, registerAsset } = useTransactionSigner();
 */
export function useTransactionSigner() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signTransaction } = useWallet();

  /**
   * Sign and send a transaction
   * @param transaction - The transaction to sign and send
   * @returns Transaction signature
   */
  const signAndSendTransaction = async (transaction: Transaction): Promise<string> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!sendTransaction) {
      throw new Error('Wallet does not support transaction signing');
    }

    try {
      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign and send transaction
      const signature = await sendTransaction(transaction, connection);

      // Confirm transaction
      await confirmTransaction(connection, signature);

      return signature;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  };

  /**
   * Register a new asset on the blockchain
   * @param name - Asset name
   * @param location - Asset location
   * @param metadataCid - IPFS metadata CID
   * @returns Transaction signature
   */
  const registerAsset = async (
    name: string,
    location: string,
    metadataCid: string
  ): Promise<string> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      // Get program instance
      const provider = new AnchorProvider(
        connection,
        {
          publicKey,
          signTransaction: signTransaction!,
          signAllTransactions: async (txs) => {
            if (!signTransaction) throw new Error('Wallet does not support signing');
            return Promise.all(txs.map(tx => signTransaction(tx)));
          },
        },
        { commitment: 'confirmed' }
      );

      const programId = new PublicKey(SOLANA_CONFIG.programs.assetRegistry);
      const program = new Program(AssetRegistryIDL as Idl, provider);

      // Derive asset PDA
      const [assetPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('asset'), publicKey.toBuffer(), Buffer.from(name)],
        programId
      );

      // Build and send transaction
      const signature = await program.methods
        .registerAsset(name, location, metadataCid)
        .accounts({
          asset: assetPda,
          owner: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return signature;
    } catch (error) {
      console.error('Error registering asset:', error);
      throw error;
    }
  };

  /**
   * Add maintenance log entry
   * @param assetPubkey - Asset public key
   * @param note - Maintenance note
   * @param ipfsCid - IPFS CID for detailed log
   * @param performerPubkey - Performer public key
   * @returns Transaction signature
   */
  const addMaintenanceLog = async (
    assetPubkey: PublicKey,
    note: string,
    ipfsCid: string,
    performerPubkey: PublicKey
  ): Promise<string> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      // Get program instance
      const provider = new AnchorProvider(
        connection,
        {
          publicKey,
          signTransaction: signTransaction!,
          signAllTransactions: async (txs) => {
            if (!signTransaction) throw new Error('Wallet does not support signing');
            return Promise.all(txs.map(tx => signTransaction(tx)));
          },
        },
        { commitment: 'confirmed' }
      );

      const programId = new PublicKey(SOLANA_CONFIG.programs.assetRegistry);
      const program = new Program(AssetRegistryIDL as Idl, provider);

      // Derive maintenance log PDA
      const [maintenanceLogPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('maintenance_log'), assetPubkey.toBuffer()],
        programId
      );

      // Build and send transaction
      const signature = await program.methods
        .addMaintenanceLog(note, ipfsCid)
        .accounts({
          maintenanceLog: maintenanceLogPda,
          asset: assetPubkey,
          performer: performerPubkey,
          owner: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return signature;
    } catch (error) {
      console.error('Error adding maintenance log:', error);
      throw error;
    }
  };

  /**
   * Update asset status
   * @param assetPubkey - Asset public key
   * @param newStatus - New status (0=ACTIVE, 1=MAINTENANCE, 2=RETIRED, 3=DISPOSED)
   * @returns Transaction signature
   */
  const updateAssetStatus = async (
    assetPubkey: PublicKey,
    newStatus: number
  ): Promise<string> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      // Get program instance
      const provider = new AnchorProvider(
        connection,
        {
          publicKey,
          signTransaction: signTransaction!,
          signAllTransactions: async (txs) => {
            if (!signTransaction) throw new Error('Wallet does not support signing');
            return Promise.all(txs.map(tx => signTransaction(tx)));
          },
        },
        { commitment: 'confirmed' }
      );

      const program = new Program(AssetRegistryIDL as Idl, provider);

      // Build and send transaction
      const signature = await program.methods
        .updateAssetStatus(newStatus)
        .accounts({
          asset: assetPubkey,
          owner: publicKey,
        })
        .rpc();

      return signature;
    } catch (error) {
      console.error('Error updating asset status:', error);
      throw error;
    }
  };

  return {
    signAndSendTransaction,
    registerAsset,
    addMaintenanceLog,
    updateAssetStatus,
    isConnected: !!publicKey,
    publicKey,
  };
}
