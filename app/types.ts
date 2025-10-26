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

