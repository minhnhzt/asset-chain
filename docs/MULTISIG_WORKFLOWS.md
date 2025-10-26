# Multi-Signature Workflows Documentation

## Overview

The Asset Manager now supports **M-of-N multi-signature (multi-sig) approval workflows** for critical asset operations. This feature enables teams to enforce governance, compliance, and security requirements by requiring multiple stakeholders to approve changes before they take effect.

## Key Features

- **Flexible Approval Rules**: Configure any M-of-N threshold (e.g., 2-of-3, 3-of-5)
- **Request Tracking**: Full audit trail of all approval requests and their status
- **Multiple Request Types**: Support for metadata updates, status changes, retirements, and adding approvers
- **Real-time Notifications**: Approvers see pending requests immediately
- **Rejection Handling**: Approvers can reject requests with optional feedback messages
- **Immutable History**: All approvals/rejections recorded for compliance

---

## Use Cases

### 1. Asset Metadata Updates
**Scenario**: A facility manager wants to update an asset's metadata (e.g., location change).
- **Requirement**: 2 of 3 regional managers must approve
- **Benefit**: Prevents unauthorized updates and ensures accuracy

### 2. Status Changes
**Scenario**: Moving an asset from ACTIVE to MAINTENANCE for servicing.
- **Requirement**: 1 of 2 technicians must approve
- **Benefit**: Ensures proper authorization for operational changes

### 3. Asset Retirement
**Scenario**: Decommissioning an asset at end-of-life.
- **Requirement**: 3 of 4 department heads must approve
- **Benefit**: Prevents accidental deletions and ensures proper documentation

### 4. Adding Approvers
**Scenario**: Expanding the approval group when onboarding new team members.
- **Requirement**: Majority of current approvers must agree
- **Benefit**: Maintains governance consistency

---

## Architecture

### Account Structures

The multi-sig system operates alongside existing accounts:

```typescript
// Multi-Signature Request
interface MultiSigRequest {
  id: string;                          // Unique request ID
  requestType: string;                 // Type: UPDATE_METADATA | CHANGE_STATUS | RETIRE_ASSET | ADD_APPROVER
  assetId: string;                     // Asset being modified
  requiredApprovals: number;           // M (minimum approvals needed)
  currentApprovals: number;            // N (total approvers)
  approvers: string[];                 // Array of authorized approver pubkeys
  approvedBy: string[];                // Pubkeys who approved
  rejectedBy: string[];                // Pubkeys who rejected
  requestData: {
    newMetadataCid?: string;           // For UPDATE_METADATA
    newStatus?: number;                // For CHANGE_STATUS
    newApproverPubkey?: string;        // For ADD_APPROVER
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  createdAt: number;                   // Unix timestamp
  updatedAt: number;                   // Unix timestamp
  createdBy: string;                   // Pubkey of requester
}

// Multi-Signature Configuration
interface AssetMultiSigConfig {
  assetId: string;                     // Which asset this config applies to
  approvers: string[];                 // List of approver wallet addresses
  requiredApprovals: number;           // M value (minimum approvals)
  totalApprovers: number;              // N value (total approvers)
  createdAt: number;                   // When config was created
  updatedAt: number;                   // Last update time
  owner: string;                       // Asset owner's pubkey
}
```

### Data Flow

```
1. Asset Owner Creates Request
   ↓
2. Request Stored with PENDING Status
   ↓
3. Approvers Notified of Pending Request
   ↓
4. Each Approver Votes (Approve/Reject)
   ↓
5. System Checks Thresholds
   ├─ If M approvals reached → Status = APPROVED
   ├─ If majority rejects → Status = REJECTED
   └─ Otherwise → Status = PENDING (waiting for more votes)
   ↓
6. Action Executed or Rejected
```

---

## API Reference

### 1. Configure Multi-Signature

**Endpoint**: `POST /api/multisig-config`

Set up the approval group and threshold for an asset.

**Request Body**:
```json
{
  "assetId": "asset_123",
  "approvers": [
    "7xL...pubkey1",
    "8mK...pubkey2",
    "9nP...pubkey3"
  ],
  "requiredApprovals": 2,
  "owner": "5aB...owner_pubkey"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Multi-sig configuration saved",
  "config": {
    "assetId": "asset_123",
    "approvers": ["7xL...pubkey1", "8mK...pubkey2", "9nP...pubkey3"],
    "requiredApprovals": 2,
    "totalApprovers": 3,
    "createdAt": 1697500000000,
    "updatedAt": 1697500000000,
    "owner": "5aB...owner_pubkey"
  }
}
```

---

### 2. Get Multi-Signature Configuration

**Endpoint**: `GET /api/multisig-config?assetId=asset_123`

Retrieve the approval configuration for an asset.

**Response**:
```json
{
  "success": true,
  "config": {
    "assetId": "asset_123",
    "approvers": ["7xL...pubkey1", "8mK...pubkey2", "9nP...pubkey3"],
    "requiredApprovals": 2,
    "totalApprovers": 3,
    ...
  }
}
```

---

### 3. Create Approval Request

**Endpoint**: `POST /api/multisig-requests`

Submit a request for multi-sig approval.

**Request Body** (Update Metadata Example):
```json
{
  "requestType": "UPDATE_METADATA",
  "assetId": "asset_123",
  "approvers": ["7xL...pubkey1", "8mK...pubkey2", "9nP...pubkey3"],
  "requiredApprovals": 2,
  "requestData": {
    "newMetadataCid": "QmVxk7..."
  },
  "createdBy": "5aB...requester_pubkey"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Multi-sig request created successfully",
  "request": {
    "id": "req_1",
    "requestType": "UPDATE_METADATA",
    "assetId": "asset_123",
    "requiredApprovals": 2,
    "currentApprovals": 0,
    "approvers": ["7xL...pubkey1", "8mK...pubkey2", "9nP...pubkey3"],
    "approvedBy": [],
    "rejectedBy": [],
    "requestData": { "newMetadataCid": "QmVxk7..." },
    "status": "PENDING",
    "createdAt": 1697500000000,
    "updatedAt": 1697500000000,
    "createdBy": "5aB...requester_pubkey"
  }
}
```

---

### 4. Submit Approval/Rejection

**Endpoint**: `POST /api/multisig-requests/[requestId]`

Vote on a pending approval request.

**Request Body**:
```json
{
  "approverPubkey": "8mK...pubkey2",
  "approvalStatus": "APPROVED",
  "approvalMessage": "Looks good!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Request approved successfully",
  "request": {
    "id": "req_1",
    "requestType": "UPDATE_METADATA",
    "assetId": "asset_123",
    "requiredApprovals": 2,
    "currentApprovals": 1,
    "approvers": ["7xL...pubkey1", "8mK...pubkey2", "9nP...pubkey3"],
    "approvedBy": ["8mK...pubkey2"],
    "rejectedBy": [],
    "status": "PENDING",
    ...
  }
}
```

---

### 5. Fetch Pending Requests

**Endpoint**: `GET /api/multisig-requests?status=PENDING&approver=8mK...pubkey2`

Get all pending requests for a specific approver.

**Query Parameters**:
- `status`: Filter by status (PENDING, APPROVED, REJECTED, EXECUTED)
- `assetId`: Filter by asset ID
- `approver`: Filter by approver pubkey

**Response**:
```json
{
  "success": true,
  "count": 3,
  "requests": [
    {
      "id": "req_1",
      "requestType": "UPDATE_METADATA",
      "status": "PENDING",
      ...
    },
    ...
  ]
}
```

---

## Frontend Components

### MultiSigConfigForm

Configure approval settings for an asset.

```typescript
import MultiSigConfigForm from '@/app/components/MultiSigConfigForm';

<MultiSigConfigForm
  assetId="asset_123"
  ownerPubkey="5aB...owner"
  onConfigCreated={(config) => console.log('Created:', config)}
  onError={(error) => console.error(error)}
/>
```

**Features**:
- Add/remove approvers dynamically
- Set M-of-N threshold
- Validation for duplicate approvers
- Success feedback

---

### MultiSigRequestForm

Create approval requests for asset modifications.

```typescript
import MultiSigRequestForm from '@/app/components/MultiSigRequestForm';

<MultiSigRequestForm
  assetId="asset_123"
  approvers={["7xL...", "8mK...", "9nP..."]}
  requiredApprovals={2}
  requesterPubkey="5aB...requester"
  onRequestCreated={(request) => console.log('Created:', request)}
  onError={(error) => console.error(error)}
/>
```

**Features**:
- Select request type (metadata, status, retire, add approver)
- Type-specific input fields
- Approval threshold display
- Real-time validation

---

### MultiSigApprovalPanel

Dashboard for approvers to review and vote on requests.

```typescript
import MultiSigApprovalPanel from '@/app/components/MultiSigApprovalPanel';

<MultiSigApprovalPanel
  approverPubkey="8mK...approver"
  onApprovalSubmitted={(request) => console.log('Voted:', request)}
  onError={(error) => console.error(error)}
/>
```

**Features**:
- Real-time polling (5s refresh)
- Approval/rejection with optional message
- Progress bars showing vote counts
- Status badges
- Automatic filtering

---

### MultiSigRequestHistory

View all approval requests with filtering.

```typescript
import MultiSigRequestHistory from '@/app/components/MultiSigRequestHistory';

<MultiSigRequestHistory
  assetId="asset_123"  // Optional: filter by asset
/>
```

**Features**:
- Filter by status (ALL, PENDING, APPROVED, REJECTED)
- Tabular view with key details
- Approval progress visualization
- Auto-refresh (10s)
- Empty state handling

---

## Integration Examples

### Example 1: Setup Multi-Sig for New Asset

```typescript
// 1. User creates an asset (existing flow)
const assetId = 'asset_123';

// 2. Owner configures multi-sig
const config = await fetch('/api/multisig-config', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    assetId,
    approvers: [
      'manager1_pubkey',
      'manager2_pubkey',
      'manager3_pubkey'
    ],
    requiredApprovals: 2,
    owner: 'asset_owner_pubkey'
  })
});
```

### Example 2: Update Metadata with Approval

```typescript
// 1. Requester creates approval request
const request = await fetch('/api/multisig-requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requestType: 'UPDATE_METADATA',
    assetId,
    approvers: config.approvers,
    requiredApprovals: config.requiredApprovals,
    requestData: {
      newMetadataCid: 'QmNewCID...'
    },
    createdBy: 'requester_pubkey'
  })
});

// 2. Approver 1 votes
await fetch(`/api/multisig-requests/${request.id}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    approverPubkey: 'manager1_pubkey',
    approvalStatus: 'APPROVED'
  })
});

// 3. Approver 2 votes (triggers execution since 2/2 threshold met)
await fetch(`/api/multisig-requests/${request.id}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    approverPubkey: 'manager2_pubkey',
    approvalStatus: 'APPROVED'
  })
});
// Now status = 'APPROVED', ready to execute on-chain
```

---

## Security Considerations

### 1. Approver Authorization
- Only configured approvers can vote on requests
- System validates approver pubkey against config
- Duplicate votes prevented

### 2. Immutable Audit Trail
- All votes recorded with timestamp and approver identity
- Rejection messages stored for accountability
- Request history cannot be altered (in production, use database)

### 3. Threshold Protection
- Requires configurable minimum approvals before execution
- Prevents single point of failure
- Flexible for different risk levels

### 4. Request Isolation
- Each request is independent
- Cannot modify existing requests (only create new ones)
- Status transitions are one-way

### 5. On-Chain Integration (Future)
- Multi-sig state can be anchored to blockchain
- Smart contract enforces approval constraints
- Provides cryptographic proof of authorization

---

## Roadmap & Future Enhancements

### Phase 1: Current Implementation ✅
- ✅ M-of-N approval configuration
- ✅ Request creation and voting
- ✅ Status tracking and history
- ✅ Frontend components

### Phase 2: Blockchain Integration (Q4 2025)
- [ ] Multi-sig PDA accounts in smart contract
- [ ] On-chain approval state verification
- [ ] Cryptographic vote signatures
- [ ] Smart contract execution after approval

### Phase 3: Advanced Features (Q1 2026)
- [ ] Time-locked approvals (minimum waiting period)
- [ ] Weighted voting (some approvers have more influence)
- [ ] Delegation (approvers can delegate voting rights)
- [ ] Scheduled batch approvals

### Phase 4: Enterprise Features (Q2 2026)
- [ ] Role-based approval rules (e.g., only finance team can approve retirements)
- [ ] Notification system (Slack, Email integrations)
- [ ] Approval templates (pre-configured workflows)
- [ ] Audit reports (exportable approval history)

---

## Troubleshooting

### Issue: "Not an authorized approver"
**Cause**: Your wallet pubkey is not in the approvers list for this asset.
**Solution**: Ask the asset owner to add you via the configuration form.

### Issue: "Already voted on this request"
**Cause**: You've already submitted an approval or rejection for this request.
**Solution**: Your vote is recorded. Wait for other approvers or check the history.

### Issue: Request stuck at "PENDING"
**Cause**: Not enough approvals/rejections to change status.
**Solution**: 
- If waiting for more approvals: Other approvers must vote
- Check if rejection threshold reached (majority rejects = automatic REJECTED status)

### Issue: Cannot remove approver configuration
**Cause**: You may not be the asset owner.
**Solution**: Only the asset owner can modify the configuration.

---

## Best Practices

### 1. Approval Threshold Selection
- **Single operator**: 1-of-1 (traditional single-sig)
- **Small teams (2-3 people)**: 2-of-3 (prevents single point of failure)
- **Medium teams (4-5 people)**: 2-of-4 or 3-of-5 (balance speed vs security)
- **Large organizations**: 3-of-5+ (strong governance)

### 2. Approver Selection
- Choose people with different perspectives (finance, operations, compliance)
- Avoid concentrating approvals in one department
- Include at least one person with deep asset knowledge

### 3. Request Documentation
- Always provide clear context in request descriptions
- Use rejection messages to explain concerns
- Reference specific compliance rules if applicable

### 4. Regular Audits
- Review approval history weekly
- Look for patterns of suspicious requests
- Ensure all critical changes go through approval

### 5. Onboarding New Approvers
- Use the ADD_APPROVER request type
- Document their role and responsibilities
- Brief them on compliance requirements

---

## Support & Questions

For issues, feature requests, or questions about multi-sig workflows:
1. Check the troubleshooting section above
2. Review the API reference for detailed endpoint documentation
3. Contact the development team with your asset ID and request ID

