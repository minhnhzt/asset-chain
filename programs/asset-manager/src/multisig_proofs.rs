use anchor_lang::prelude::*;
use sha2::{Sha256, Digest};

declare_id!("ProofProofProofProofProofProofProofProofProofProof1111111");

/// Maximum number of approvals that can be verified in a single proof
const MAX_APPROVALS: usize = 50;

/// Maximum length for proof notes/metadata
const MAX_PROOF_DATA: usize = 512;

#[program]
pub mod multisig_proofs {
    use super::*;

    /// Record a blockchain-anchored proof of multi-signature approvals
    /// 
    /// This instruction creates an on-chain record of approval decision hashes,
    /// making the approval immutable and auditable on the blockchain.
    /// 
    /// Arguments:
    /// - request_id: Unique identifier for the approval request
    /// - approvals_hash: SHA256 hash of the sorted approvals
    /// - approver_count: Total number of approvers
    /// - approval_threshold: Minimum approvals required
    pub fn record_approval_proof(
        ctx: Context<RecordApprovalProof>,
        request_id: String,
        approvals_hash: [u8; 32],
        approver_count: u8,
        approval_threshold: u8,
    ) -> Result<()> {
        require!(
            request_id.len() <= MAX_PROOF_DATA,
            ProofError::RequestIdTooLong
        );

        require!(
            approver_count > 0 && approver_count <= MAX_APPROVALS as u8,
            ProofError::InvalidApproverCount
        );

        require!(
            approval_threshold > 0 && approval_threshold <= approver_count,
            ProofError::InvalidThreshold
        );

        let proof_account = &mut ctx.accounts.approval_proof;
        
        // Set the proof data
        proof_account.owner = ctx.accounts.owner.key();
        proof_account.request_id = request_id.clone();
        proof_account.approvals_hash = approvals_hash;
        proof_account.approver_count = approver_count;
        proof_account.approval_threshold = approval_threshold;
        proof_account.recorded_at = Clock::get()?.unix_timestamp;
        proof_account.bump = ctx.bumps.approval_proof;
        proof_account.is_verified = false;

        // Emit event for off-chain indexing
        emit!(ApprovalProofRecorded {
            request_id: request_id.clone(),
            owner: proof_account.owner,
            approvals_hash: approvals_hash.to_vec(),
            approver_count,
            approval_threshold,
            timestamp: proof_account.recorded_at,
        });

        msg!("Approval proof recorded for request: {}", request_id);
        Ok(())
    }

    /// Verify a recorded approval proof against the on-chain hash
    /// 
    /// This instruction allows anyone to verify that a recorded proof
    /// matches the expected hash, proving the integrity of the approval decision.
    pub fn verify_approval_proof(
        ctx: Context<VerifyApprovalProof>,
        expected_hash: [u8; 32],
    ) -> Result<()> {
        let proof_account = &mut ctx.accounts.approval_proof;

        // Verify the hash matches
        require!(
            proof_account.approvals_hash == expected_hash,
            ProofError::HashMismatch
        );

        proof_account.is_verified = true;
        proof_account.verified_at = Some(Clock::get()?.unix_timestamp);

        // Emit verification event
        emit!(ApprovalProofVerified {
            request_id: proof_account.request_id.clone(),
            approvals_hash: proof_account.approvals_hash.to_vec(),
            timestamp: proof_account.verified_at.unwrap(),
        });

        msg!("Approval proof verified for request: {}", proof_account.request_id);
        Ok(())
    }

    /// Update proof metadata after verification
    /// This allows adding additional context after the proof is anchored
    pub fn update_proof_metadata(
        ctx: Context<UpdateProofMetadata>,
        metadata: String,
    ) -> Result<()> {
        require!(
            metadata.len() <= MAX_PROOF_DATA,
            ProofError::MetadataTooLong
        );

        let proof_account = &mut ctx.accounts.approval_proof;
        proof_account.metadata = Some(metadata);
        proof_account.metadata_updated_at = Some(Clock::get()?.unix_timestamp);

        msg!("Proof metadata updated for request: {}", proof_account.request_id);
        Ok(())
    }
}

// ============================================================================
// Accounts
// ============================================================================

#[derive(Accounts)]
#[instruction(request_id: String)]
pub struct RecordApprovalProof<'info> {
    /// The owner of the approval request
    #[account(mut)]
    pub owner: Signer<'info>,

    /// The approval proof account (PDA)
    /// Seeds: ["approval_proof", owner, request_id]
    #[account(
        init,
        payer = owner,
        space = 8 + ApprovalProof::LEN,
        seeds = [b"approval_proof", owner.key().as_ref(), request_id.as_ref()],
        bump,
    )]
    pub approval_proof: Account<'info, ApprovalProof>,

    /// System program required for account creation
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyApprovalProof<'info> {
    /// The owner of the approval (can be anyone verifying)
    pub owner: Signer<'info>,

    /// The approval proof account to verify
    #[account(
        mut,
        has_one = owner,
    )]
    pub approval_proof: Account<'info, ApprovalProof>,
}

#[derive(Accounts)]
pub struct UpdateProofMetadata<'info> {
    /// The owner of the approval
    #[account(mut)]
    pub owner: Signer<'info>,

    /// The approval proof account to update
    #[account(
        mut,
        has_one = owner,
    )]
    pub approval_proof: Account<'info, ApprovalProof>,
}

// ============================================================================
// State
// ============================================================================

/// On-chain record of an approval proof
#[account]
pub struct ApprovalProof {
    /// Owner/authority of this proof
    pub owner: Pubkey,

    /// Unique request identifier
    pub request_id: String,

    /// SHA256 hash of sorted approvals
    /// Each approval contains: {approverPubkey, status, timestamp}
    /// Sorted by approverPubkey for deterministic hashing
    pub approvals_hash: [u8; 32],

    /// Total number of approvers in this request
    pub approver_count: u8,

    /// Minimum approvals required for this request
    pub approval_threshold: u8,

    /// When this proof was recorded on-chain
    pub recorded_at: i64,

    /// When this proof was verified (if verified)
    pub verified_at: Option<i64>,

    /// Additional metadata about this proof
    pub metadata: Option<String>,

    /// When metadata was last updated
    pub metadata_updated_at: Option<i64>,

    /// Whether this proof has been verified
    pub is_verified: bool,

    /// Bump seed for PDA derivation
    pub bump: u8,
}

impl ApprovalProof {
    pub const LEN: usize = 
        32 +                    // owner (Pubkey)
        4 + (512) +            // request_id (String, max 512 bytes)
        32 +                    // approvals_hash ([u8; 32])
        1 +                     // approver_count (u8)
        1 +                     // approval_threshold (u8)
        8 +                     // recorded_at (i64)
        9 +                     // verified_at (Option<i64>)
        4 + (512) +            // metadata (Option<String>)
        9 +                     // metadata_updated_at (Option<i64>)
        1 +                     // is_verified (bool)
        1;                      // bump (u8)
}

// ============================================================================
// Events
// ============================================================================

#[event]
pub struct ApprovalProofRecorded {
    pub request_id: String,
    pub owner: Pubkey,
    pub approvals_hash: Vec<u8>,
    pub approver_count: u8,
    pub approval_threshold: u8,
    pub timestamp: i64,
}

#[event]
pub struct ApprovalProofVerified {
    pub request_id: String,
    pub approvals_hash: Vec<u8>,
    pub timestamp: i64,
}

// ============================================================================
// Errors
// ============================================================================

#[error_code]
pub enum ProofError {
    #[msg("Request ID exceeds maximum length")]
    RequestIdTooLong,

    #[msg("Invalid approver count (must be 1-50)")]
    InvalidApproverCount,

    #[msg("Invalid threshold (must be >= 1 and <= approver count)")]
    InvalidThreshold,

    #[msg("Approval hash does not match expected hash")]
    HashMismatch,

    #[msg("Proof metadata exceeds maximum length")]
    MetadataTooLong,

    #[msg("Proof already verified")]
    AlreadyVerified,

    #[msg("Unauthorized access")]
    UnauthorizedAccess,
}
