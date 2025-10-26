export interface AssetData {
  pubkey: string;
  owner: string;
  name: string;
  location: string;
  metadata_cid: string;
  status: number;
  created_at: number;
  updated_at: number;
}

export interface MultiSigRequest {
  id: string;
  requestType: 'UPDATE_METADATA' | 'CHANGE_STATUS' | 'RETIRE_ASSET' | 'ADD_APPROVER';
  assetId: string;
  requiredApprovals: number;
  currentApprovals: number;
  approvers: string[]; // Array of approver pubkeys
  approvedBy: string[]; // Array of pubkeys who have approved
  rejectedBy: string[]; // Array of pubkeys who have rejected
  requestData: {
    newMetadataCid?: string;
    newStatus?: number;
    newApproverPubkey?: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  createdAt: number;
  updatedAt: number;
  createdBy: string;

  // NEW: Optional blockchain proof tracking
  blockchainProof?: {
    status: 'NOT_ANCHORED' | 'ANCHORING' | 'ANCHORED' | 'VERIFIED' | 'FAILED';
    proofId?: string;
    txHash?: string;              // Solana transaction hash
    pda?: string;                 // Proof PDA address
    approvalsHash?: string;       // SHA256 of approval data
    anchoredAt?: number;          // Blockchain timestamp
    verifiedAt?: number;          // When proof was verified
    error?: string;               // If anchor failed
  };
}

export interface MultiSigApproval {
  requestId: string;
  approverPubkey: string;
  approvalStatus: 'APPROVED' | 'REJECTED' | 'PENDING';
  approvalMessage?: string;
  approvalTimestamp: number;
}

export interface AssetMultiSigConfig {
  assetId: string;
  approvers: string[]; // Array of approver pubkeys
  requiredApprovals: number; // M-of-N approval
  totalApprovers: number; // N value
  createdAt: number;
  updatedAt: number;
  owner: string;
}

// NEW: Blockchain Proof Interfaces (Phase 2)

export interface BlockchainApprovalProof {
  proofId: string;
  requestId: string;
  assetId: string;
  approvalsHash: string;        // SHA256 hash of approvals (immutable)
  approverCount: number;        // How many approved
  approvalThreshold: number;    // How many were needed
  timestamp: number;            // When anchored on-chain
  status: 'ANCHORING' | 'ANCHORED' | 'VERIFIED' | 'FAILED';
  txHash?: string;              // Solana transaction hash
  pda?: string;                 // PDA account address
  verifiedAt?: number;          // When verification completed
  error?: string;               // Error message if failed
}

export interface ProofVerification {
  requestId: string;
  isValid: boolean;
  message: string;
  verifiedAt: number;
  expectedHash?: string;
  verification: {
    type: string;
    method: 'LOCAL_HASH_MATCH' | 'ON_CHAIN_VERIFICATION';
    timestamp: number;
  };
}

