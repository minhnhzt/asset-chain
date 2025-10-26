# Multi-Signature Quick Reference

## 🚀 5-Minute Setup

### Step 1: Configure Multi-Sig for an Asset
```typescript
POST /api/multisig-config
{
  "assetId": "asset_123",
  "approvers": ["wallet1", "wallet2", "wallet3"],
  "requiredApprovals": 2,
  "owner": "owner_wallet"
}
```

### Step 2: Create an Approval Request
```typescript
POST /api/multisig-requests
{
  "requestType": "UPDATE_METADATA",
  "assetId": "asset_123",
  "approvers": ["wallet1", "wallet2", "wallet3"],
  "requiredApprovals": 2,
  "requestData": {
    "newMetadataCid": "QmNewHash..."
  },
  "createdBy": "requester_wallet"
}
// Returns: { request: { id: "req_1", status: "PENDING", ... } }
```

### Step 3: Approvers Vote
```typescript
POST /api/multisig-requests/req_1
{
  "approverPubkey": "wallet1",
  "approvalStatus": "APPROVED"
}
// Approver 1 votes APPROVED
// Status: PENDING (1/2 approvals)

POST /api/multisig-requests/req_1
{
  "approverPubkey": "wallet2",
  "approvalStatus": "APPROVED"
}
// Approver 2 votes APPROVED
// Status: APPROVED (2/2 approvals) ✅ Ready to execute!
```

---

## 📋 Request Types

| Type | Usage | Fields |
|------|-------|--------|
| `UPDATE_METADATA` | Change asset metadata | `newMetadataCid` |
| `CHANGE_STATUS` | Modify asset status | `newStatus` (0-3) |
| `RETIRE_ASSET` | Decommission asset | (none) |
| `ADD_APPROVER` | Add to approval group | `newApproverPubkey` |

---

## 🎨 React Components

### Show Multi-Sig Config Form
```typescript
import MultiSigConfigForm from '@/app/components/MultiSigConfigForm';

<MultiSigConfigForm
  assetId="asset_123"
  ownerPubkey={wallet.publicKey.toString()}
  onConfigCreated={(config) => console.log('Configured:', config.approvers)}
  onError={(err) => console.error(err)}
/>
```

### Create Approval Request
```typescript
import MultiSigRequestForm from '@/app/components/MultiSigRequestForm';

<MultiSigRequestForm
  assetId="asset_123"
  approvers={["wallet1", "wallet2", "wallet3"]}
  requiredApprovals={2}
  requesterPubkey={wallet.publicKey.toString()}
  onRequestCreated={(request) => alert(`Created: ${request.id}`)}
  onError={(err) => console.error(err)}
/>
```

### Approver Dashboard
```typescript
import MultiSigApprovalPanel from '@/app/components/MultiSigApprovalPanel';

<MultiSigApprovalPanel
  approverPubkey={wallet.publicKey.toString()}
  onApprovalSubmitted={(request) => console.log('Voted on:', request.id)}
  onError={(err) => console.error(err)}
/>
```

### View Request History
```typescript
import MultiSigRequestHistory from '@/app/components/MultiSigRequestHistory';

<MultiSigRequestHistory assetId="asset_123" />
```

---

## 📊 Status Transitions

```
PENDING (0 to M-1 approvals)
   ├─→ APPROVED (M approvals reached) ✅
   └─→ REJECTED (majority rejects) ❌

APPROVED → EXECUTED (on-chain)
REJECTED → ARCHIVED
```

---

## 🔍 Query Examples

### Get Pending Requests for Me
```typescript
GET /api/multisig-requests?status=PENDING&approver=my_wallet
```

### Get All Requests for an Asset
```typescript
GET /api/multisig-requests?assetId=asset_123
```

### Filter by Status
```typescript
GET /api/multisig-requests?status=APPROVED
GET /api/multisig-requests?status=REJECTED
GET /api/multisig-requests?status=PENDING
```

### Get Request Details
```typescript
GET /api/multisig-requests/req_1
```

---

## ⚙️ Configuration Examples

### Simple (1-of-1 = Single Owner)
```json
{
  "assetId": "asset_123",
  "approvers": ["owner_wallet"],
  "requiredApprovals": 1
}
```

### Standard (2-of-3 = Small Team)
```json
{
  "assetId": "asset_123",
  "approvers": ["mgr1", "mgr2", "mgr3"],
  "requiredApprovals": 2
}
```

### Enterprise (3-of-5 = Large Org)
```json
{
  "assetId": "asset_123",
  "approvers": ["cfo", "ceo", "cto", "head_ops", "head_legal"],
  "requiredApprovals": 3
}
```

---

## 🛡️ Security Checklist

- ✅ Only configured approvers can vote
- ✅ Each approver votes only once per request
- ✅ No way to modify votes (new request required)
- ✅ All votes logged with timestamp
- ✅ Immutable audit trail
- ✅ Majority rejection prevents execution
- ✅ Request ID is unique per transaction

---

## ⚡ Performance Tips

### 1. Reduce Polling Overhead
```typescript
// Instead of component polling, use real-time subscriptions
useEffect(() => {
  const unsubscribe = subscribeToMultiSigUpdates(
    approverPubkey,
    handleUpdate
  );
  return unsubscribe;
}, []);
```

### 2. Cache Configurations
```typescript
// Cache multi-sig config for 5 minutes
const configCache = new Map();
function getCachedConfig(assetId) {
  return configCache.get(assetId);
}
```

### 3. Batch Request Queries
```typescript
// Get last 20 pending requests, not all
GET /api/multisig-requests?status=PENDING&limit=20&page=1
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Not an authorized approver" | Ask asset owner to add you to approvers list |
| "Already voted on this request" | Your vote was recorded; can't change it |
| Request stuck at PENDING | Waiting for more approvers to vote |
| Cannot remove approver | Only asset owner can modify config |
| API returns 404 | Request ID doesn't exist (check spelling) |

---

## 📚 Full Documentation

- **Complete Architecture**: `docs/MULTISIG_WORKFLOWS.md`
- **Integration Guide**: `docs/MULTISIG_INTEGRATION_GUIDE.md`
- **Implementation Details**: `docs/MULTISIG_IMPLEMENTATION_SUMMARY.md`

---

## 🔗 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/multisig-config` | Create/update config |
| `GET` | `/api/multisig-config` | Get config for asset |
| `DELETE` | `/api/multisig-config` | Remove config |
| `POST` | `/api/multisig-requests` | Create request |
| `GET` | `/api/multisig-requests` | List requests |
| `GET` | `/api/multisig-requests/[id]` | Get request details |
| `POST` | `/api/multisig-requests/[id]` | Submit vote |

---

## 💡 Tips & Tricks

### Tip 1: Batch Multiple Approvals
Create requests in batches then have approvers vote on all together.

### Tip 2: Use Rejection Messages
Provide context when rejecting to help requester improve next attempt.

### Tip 3: Monitor Voting Patterns
Track who approves/rejects frequently to spot issues early.

### Tip 4: Set Approval Thresholds Wisely
- **Too high** (e.g., 5-of-5): Nothing ever gets approved ❌
- **Too low** (e.g., 1-of-5): No security benefit ❌
- **Just right** (e.g., 2-of-3): Balances security and speed ✅

---

## 🚀 Next Steps

1. **Try it out**: Visit `/dashboard` and test multi-sig workflows
2. **Integrate**: Add components to your asset details page
3. **Test voting**: Have team members try approving requests
4. **Gather feedback**: Collect user experience suggestions
5. **Deploy**: Push to production when ready

---

**Last Updated**: October 26, 2025
**Status**: Production Ready ✅
