# Multi-Signature Integration Quick Start

## Adding Multi-Sig to Your Asset Dashboard

### Step 1: Import Components

```typescript
import MultiSigConfigForm from '@/app/components/MultiSigConfigForm';
import MultiSigRequestForm from '@/app/components/MultiSigRequestForm';
import MultiSigApprovalPanel from '@/app/components/MultiSigApprovalPanel';
import MultiSigRequestHistory from '@/app/components/MultiSigRequestHistory';
```

### Step 2: Update Your Dashboard Page

```typescript
'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import MultiSigConfigForm from '@/app/components/MultiSigConfigForm';
import MultiSigRequestForm from '@/app/components/MultiSigRequestForm';
import MultiSigApprovalPanel from '@/app/components/MultiSigApprovalPanel';
import MultiSigRequestHistory from '@/app/components/MultiSigRequestHistory';
import { AssetMultiSigConfig } from '@/app/types';

export default function MultiSigDashboard() {
  const { publicKey } = useWallet();
  const [assetId, setAssetId] = useState('');
  const [multiSigConfig, setMultiSigConfig] = useState<AssetMultiSigConfig | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'config' | 'create' | 'approve' | 'history'>('config');

  const handleConfigCreated = (config: AssetMultiSigConfig) => {
    setMultiSigConfig(config);
    setError('');
    alert('Multi-sig configuration created successfully!');
  };

  if (!publicKey) {
    return <div className="p-4 text-red-600">Please connect your wallet first</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Multi-Signature Management</h1>

      {/* Asset Selection */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Asset ID
        </label>
        <input
          type="text"
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          placeholder="Enter asset ID"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        {(['config', 'create', 'approve', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'config' && (
          <MultiSigConfigForm
            assetId={assetId}
            ownerPubkey={publicKey.toString()}
            onConfigCreated={handleConfigCreated}
            onError={setError}
          />
        )}

        {activeTab === 'create' && multiSigConfig && (
          <MultiSigRequestForm
            assetId={assetId}
            approvers={multiSigConfig.approvers}
            requiredApprovals={multiSigConfig.requiredApprovals}
            requesterPubkey={publicKey.toString()}
            onRequestCreated={(request) => {
              setError('');
              alert(`Request created: ${request.id}`);
            }}
            onError={setError}
          />
        )}

        {activeTab === 'approve' && (
          <MultiSigApprovalPanel
            approverPubkey={publicKey.toString()}
            onApprovalSubmitted={(request) => {
              setError('');
              alert(`Vote recorded for ${request.id}`);
            }}
            onError={setError}
          />
        )}

        {activeTab === 'history' && (
          <MultiSigRequestHistory assetId={assetId} />
        )}
      </div>
    </div>
  );
}
```

### Step 3: API Usage Examples

#### Fetch Multi-Sig Config
```typescript
const response = await fetch(`/api/multisig-config?assetId=${assetId}`);
const data = await response.json();
if (data.config) {
  console.log('Approvers:', data.config.approvers);
  console.log('Required approvals:', data.config.requiredApprovals);
}
```

#### Create Approval Request
```typescript
const response = await fetch('/api/multisig-requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requestType: 'UPDATE_METADATA',
    assetId,
    approvers: config.approvers,
    requiredApprovals: config.requiredApprovals,
    requestData: {
      newMetadataCid: 'QmNewHash...'
    },
    createdBy: publicKey.toString()
  })
});
const data = await response.json();
console.log('Request ID:', data.request.id);
```

#### Submit Vote
```typescript
const response = await fetch(`/api/multisig-requests/${requestId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    approverPubkey: publicKey.toString(),
    approvalStatus: 'APPROVED',
    approvalMessage: 'Approved by Finance Team'
  })
});
const data = await response.json();
if (data.request.status === 'APPROVED') {
  console.log('Request approved! Ready to execute on-chain');
}
```

### Step 4: Handle On-Chain Execution

```typescript
// After multi-sig approval is reached (status = 'APPROVED')
async function executeMultiSigApprovedRequest(request: MultiSigRequest) {
  try {
    // Verify approval status
    if (request.status !== 'APPROVED') {
      throw new Error('Request not fully approved');
    }

    // Verify all required signatures are present
    if (request.approvedBy.length < request.requiredApprovals) {
      throw new Error('Not enough approvals');
    }

    // Execute action based on request type
    switch (request.requestType) {
      case 'UPDATE_METADATA':
        // Call program instruction to update metadata
        // Pass approval signatures as proof
        await updateAssetMetadata(request.assetId, request.requestData.newMetadataCid!);
        break;

      case 'CHANGE_STATUS':
        // Call program instruction to change status
        await changeAssetStatus(request.assetId, request.requestData.newStatus!);
        break;

      case 'RETIRE_ASSET':
        // Call program instruction to retire asset
        await retireAsset(request.assetId);
        break;

      case 'ADD_APPROVER':
        // Add new approver to configuration
        const newConfig = { ...multiSigConfig };
        newConfig.approvers.push(request.requestData.newApproverPubkey!);
        newConfig.totalApprovers += 1;
        setMultiSigConfig(newConfig);
        break;
    }

    console.log('Request executed successfully');
  } catch (error) {
    console.error('Failed to execute request:', error);
  }
}
```

---

## Component Props Reference

### MultiSigConfigForm

```typescript
interface Props {
  assetId: string;                                    // Asset being configured
  ownerPubkey: string;                                // Asset owner's wallet address
  onConfigCreated: (config: AssetMultiSigConfig) => void;  // Success callback
  onError: (error: string) => void;                   // Error callback
}
```

### MultiSigRequestForm

```typescript
interface Props {
  assetId: string;                                    // Asset being modified
  approvers: string[];                                // List of authorized approvers
  requiredApprovals: number;                          // M-of-N threshold
  requesterPubkey: string;                            // Wallet creating request
  onRequestCreated: (request: MultiSigRequest) => void;  // Success callback
  onError: (error: string) => void;                   // Error callback
}
```

### MultiSigApprovalPanel

```typescript
interface Props {
  approverPubkey: string;                             // This approver's wallet address
  onApprovalSubmitted: (request: MultiSigRequest) => void;  // Vote submitted callback
  onError: (error: string) => void;                   // Error callback
}
```

### MultiSigRequestHistory

```typescript
interface Props {
  assetId?: string;                                   // Optional: filter by asset
}
```

---

## State Management Tips

### Using React Hooks

```typescript
const [config, setConfig] = useState<AssetMultiSigConfig | null>(null);
const [pendingRequests, setPendingRequests] = useState<MultiSigRequest[]>([]);
const [loading, setLoading] = useState(false);

// Fetch config on mount
useEffect(() => {
  if (!assetId) return;
  
  setLoading(true);
  fetch(`/api/multisig-config?assetId=${assetId}`)
    .then(res => res.json())
    .then(data => {
      if (data.config) setConfig(data.config);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
}, [assetId]);
```

### With Context API (Recommended for Large Apps)

```typescript
import React, { createContext, useContext } from 'react';

interface MultiSigContextType {
  config: AssetMultiSigConfig | null;
  setConfig: (config: AssetMultiSigConfig | null) => void;
  pendingRequests: MultiSigRequest[];
  addRequest: (request: MultiSigRequest) => void;
}

const MultiSigContext = createContext<MultiSigContextType | undefined>(undefined);

export function MultiSigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<AssetMultiSigConfig | null>(null);
  const [pendingRequests, setPendingRequests] = React.useState<MultiSigRequest[]>([]);

  const addRequest = (request: MultiSigRequest) => {
    setPendingRequests([...pendingRequests, request]);
  };

  return (
    <MultiSigContext.Provider value={{ config, setConfig, pendingRequests, addRequest }}>
      {children}
    </MultiSigContext.Provider>
  );
}

export function useMultiSig() {
  const context = useContext(MultiSigContext);
  if (!context) {
    throw new Error('useMultiSig must be used within MultiSigProvider');
  }
  return context;
}
```

---

## Testing the Multi-Sig Flow

### Manual Testing Checklist

- [ ] Create multi-sig configuration with 2-of-3 approvers
- [ ] Create approval request as asset owner
- [ ] First approver votes APPROVED
- [ ] Verify status still PENDING (waiting for 2nd approval)
- [ ] Second approver votes APPROVED
- [ ] Verify status changes to APPROVED
- [ ] Third approver votes REJECTED
- [ ] Verify status becomes REJECTED (majority rules)
- [ ] Attempt to vote twice (should fail)
- [ ] Verify non-approver cannot vote (should fail)
- [ ] Test all four request types (UPDATE_METADATA, CHANGE_STATUS, RETIRE_ASSET, ADD_APPROVER)

### Unit Test Example

```typescript
describe('MultiSigRequestForm', () => {
  it('should create a request with valid input', async () => {
    const onCreated = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <MultiSigRequestForm
        assetId="test_asset"
        approvers={['addr1', 'addr2', 'addr3']}
        requiredApprovals={2}
        requesterPubkey="requester"
        onRequestCreated={onCreated}
        onError={jest.fn()}
      />
    );

    const input = getByPlaceholderText('e.g., QmVxk7...');
    fireEvent.change(input, { target: { value: 'QmNewHash' } });
    fireEvent.click(getByText('Create Approval Request'));

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalled();
    });
  });
});
```

---

## Production Considerations

### 1. Replace In-Memory Storage with Database

**Current**: Uses `Map` in memory (lost on server restart)
**Production**: Use PostgreSQL, MongoDB, or Firebase

```typescript
// Example with PostgreSQL
import { pool } from '@/lib/db';

export async function getMultiSigConfig(assetId: string) {
  const result = await pool.query(
    'SELECT * FROM multisig_configs WHERE asset_id = $1',
    [assetId]
  );
  return result.rows[0] || null;
}
```

### 2. Add Real-Time Notifications

```typescript
// Notify approvers when request created
import { sendEmail } from '@/lib/mailer';

const approvers = config.approvers;
for (const approver of approvers) {
  const user = await getUserByPubkey(approver);
  if (user.email) {
    await sendEmail({
      to: user.email,
      subject: `New approval request for asset ${assetId}`,
      template: 'multisig_request_notification',
      context: { request, assetName: 'Asset #123' }
    });
  }
}
```

### 3. Integrate with Blockchain

```typescript
// Store approval hash on-chain for immutability
const approvalProof = {
  requestId: request.id,
  approvals: request.approvedBy,
  timestamp: Date.now(),
  hash: sha256(JSON.stringify({ requestId, approvals }))
};

// Call smart contract to anchor approval
await program.methods.recordApproval(approvalProof)
  .accounts({...})
  .signers([...])
  .rpc();
```

### 4. Add Role-Based Access Control

```typescript
// Only certain users can create/reject requests
async function canUserApprove(userId: string, assetId: string): Promise<boolean> {
  const config = await getMultiSigConfig(assetId);
  const user = await getUser(userId);
  return config.approvers.includes(user.solana_pubkey);
}

// Middleware
app.post('/api/multisig-requests/:id', async (req, res) => {
  if (!await canUserApprove(req.user.id, req.body.assetId)) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  // ... handle approval
});
```

---

## Performance Optimization

### Caching Strategies

```typescript
// Cache multi-sig configs for 5 minutes
const configCache = new Map<string, { data: AssetMultiSigConfig; expires: number }>();

function getCachedConfig(assetId: string): AssetMultiSigConfig | null {
  const cached = configCache.get(assetId);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  configCache.delete(assetId);
  return null;
}

function setCachedConfig(assetId: string, config: AssetMultiSigConfig) {
  configCache.set(assetId, {
    data: config,
    expires: Date.now() + 5 * 60 * 1000
  });
}
```

### Pagination for Large Request Lists

```typescript
// Add pagination to request queries
GET /api/multisig-requests?page=1&limit=20&status=PENDING

interface PaginatedResponse {
  requests: MultiSigRequest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

---

## Troubleshooting

### Component Not Rendering
- Verify wallet is connected
- Check browser console for errors
- Ensure API endpoints are accessible

### Approval Status Not Updating
- Check browser network tab for failed requests
- Verify approver pubkey matches database
- Ensure JSON Content-Type header is set

### Performance Issues with Large Datasets
- Implement pagination
- Add caching layer
- Index database queries by assetId and status

