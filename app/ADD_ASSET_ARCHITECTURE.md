# Add Asset - Technical Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Add Asset Page                          │
│                    (React Component Layer)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├─── Form State Management
                              │    └── React Hooks (useState)
                              │
                              ├─── Validation Layer
                              │    └── Client-side validation
                              │
                              └─── Integration Layer
                                   │
                 ┌─────────────────┼─────────────────┐
                 │                 │                 │
                 ▼                 ▼                 ▼
         ┌───────────┐     ┌──────────┐     ┌──────────┐
         │   IPFS    │     │  Wallet  │     │ Solana   │
         │  Pinata   │     │ Phantom  │     │  Devnet  │
         └───────────┘     └──────────┘     └──────────┘
              │                  │                │
              │                  │                │
              ▼                  ▼                ▼
         Metadata           Transaction        SPL Token
         Storage             Signing           Minting
```

---

## 📦 Component Hierarchy

```
AddAssetPage
│
├── Header Section
│   ├── Back Button
│   └── Title + Description
│
├── Benefits Card
│   └── 4x Feature Highlights
│
├── Main Form Area (2/3 width)
│   │
│   ├── Basic Information Card
│   │   ├── Asset Name *
│   │   ├── Category *
│   │   ├── Description
│   │   ├── Serial Number
│   │   ├── Manufacturer
│   │   └── Model
│   │
│   ├── Financial Information Card
│   │   ├── Purchase Value
│   │   ├── Purchase Date
│   │   └── Warranty Expiry
│   │
│   ├── Location & Assignment Card
│   │   ├── Location
│   │   └── Assigned To
│   │
│   └── Additional Notes Card
│       └── Notes Textarea
│
├── Sidebar Area (1/3 width)
│   │
│   ├── Image Upload Card
│   │   ├── Upload Button
│   │   └── Image Preview
│   │
│   ├── Minting Info Card
│   │   └── Feature List
│   │
│   └── Action Buttons
│       ├── Mint Asset (Primary)
│       └── Clear Form (Secondary)
│
└── Minting Progress Card (Conditional)
    └── 6x Step Indicators
        ├── Step 1: Validate
        ├── Step 2: IPFS
        ├── Step 3: Wallet
        ├── Step 4: Mint
        ├── Step 5: Record
        └── Step 6: Finalize

MintSuccessView (Post-Minting)
│
├── Success Header
│   ├── Checkmark Icon
│   └── Asset ID Display
│
├── Blockchain Details Card
│   ├── SPL Token Mint Address
│   ├── IPFS Metadata Hash
│   └── Asset Status Badge
│
├── Next Steps Card
│   └── 3x Guided Actions
│
└── Action Buttons
    ├── Register Another Asset
    └── Go to Assets
```

---

## 🔄 Data Flow Diagram

### Form Submission Flow

```
User Input
    │
    ▼
┌─────────────────┐
│   Form State    │
│  (React State)  │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   Validation    │
│  Check Required │
└─────────────────┘
    │
    ├─── Valid ───────┐
    │                 ▼
    │         Start Minting Process
    │
    └─── Invalid ────┐
                     ▼
               Show Error Toast
```

### Minting Process Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    MINTING PROCESS                           │
└──────────────────────────────────────────────────────────────┘

Step 1: VALIDATE FORM DATA
┌──────────────────┐
│ Check Required   │
│ - Name present?  │──── No ──→ Error Toast
│ - Category set?  │
└──────────────────┘
         │
        Yes
         │
         ▼

Step 2: UPLOAD TO IPFS (Pinata)
┌──────────────────────────────┐
│ Prepare Metadata JSON        │
│ {                            │
│   name, description,         │
│   category, attributes       │
│   image, properties          │
│ }                            │
└──────────────────────────────┘
         │
         ▼
┌──────────────────┐
│ POST to Pinata   │
│ /pinJSONToIPFS   │
└──────────────────┘
         │
         ▼
┌──────────────────┐
│ Receive Hash     │
│ QmXXXXXXXXX...   │
└──────────────────┘
         │
         ▼

Step 3: CONNECT WALLET (Phantom)
┌──────────────────────────┐
│ window.solana.connect()  │
└──────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Get Public Key           │
│ Check SOL Balance        │
└──────────────────────────┘
         │
         ▼

Step 4: MINT SPL TOKEN
┌────────────────────────────────┐
│ Create Mint Account            │
│ - Authority: User Wallet       │
│ - Decimals: 0 (NFT-style)      │
│ - Supply: 1                    │
└────────────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Create Associated Token Acc    │
│ - Owner: User Wallet           │
│ - Mint: New Mint Address       │
└────────────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Mint 1 Token to User           │
└────────────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Get Transaction Hash           │
│ Signature: 5KpXXXXXXX...       │
└────────────────────────────────┘
         │
         ▼

Step 5: RECORD METADATA ON-CHAIN
┌────────────────────────────────┐
│ Create Metadata Account        │
│ (Metaplex Token Metadata)      │
│                                │
│ - name: Asset Name             │
│ - symbol: ASSET                │
│ - uri: ipfs://QmXXX...         │
│ - creators: [wallet]           │
└────────────────────────────────┘
         │
         ▼

Step 6: FINALIZE REGISTRATION
┌────────────────────────────────┐
│ Generate Asset ID              │
│ ASSET-{timestamp}              │
└────────────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Update Local Database          │
│ (or send to backend API)       │
└────────────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Show Success View              │
│ with Blockchain Details        │
└────────────────────────────────┘
```

---

## 🗄️ State Management

### Component State

```typescript
interface AddAssetPageState {
  // Form Data
  formData: AssetFormData;
  
  // Image Upload
  selectedImage: File | null;
  imagePreview: string | null;
  
  // Minting Status
  isMinting: boolean;
  mintingSteps: MintingStep[];
  mintComplete: boolean;
  mintedAssetId: string | null;
}

interface AssetFormData {
  name: string;
  description: string;
  category: string;
  serialNumber: string;
  purchaseValue: string;
  purchaseDate: string;
  location: string;
  assignedTo: string;
  manufacturer: string;
  model: string;
  warrantyExpiry: string;
  notes: string;
}

interface MintingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
  txHash?: string;
  ipfsHash?: string;
}
```

### State Transitions

```
┌─────────────┐
│   Initial   │
│  (Empty)    │
└─────────────┘
      │
      ▼ (User types)
┌─────────────┐
│   Filling   │
│  (Partial)  │
└─────────────┘
      │
      ▼ (Click Mint)
┌─────────────┐
│   Minting   │
│ (Processing)│
└─────────────┘
      │
      ├─── Success ──→ ┌──────────┐
      │                │ Success  │
      │                │ (Complete)│
      │                └──────────┘
      │
      └─── Error ────→ ┌──────────┐
                       │  Error   │
                       │ (Failed) │
                       └──────────┘
```

---

## 🔌 API Integration Points

### 1. Pinata IPFS API

**Endpoint**: `https://api.pinata.cloud/pinning/pinJSONToIPFS`

**Request**:
```json
POST /pinning/pinJSONToIPFS
Headers:
  Authorization: Bearer {PINATA_JWT}
  Content-Type: application/json

Body:
{
  "pinataContent": {
    "name": "MacBook Pro 16",
    "description": "...",
    "attributes": [...]
  },
  "pinataMetadata": {
    "name": "asset-1730000000000"
  }
}
```

**Response**:
```json
{
  "IpfsHash": "QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "PinSize": 1234,
  "Timestamp": "2025-10-28T12:34:56.789Z"
}
```

### 2. Phantom Wallet API

**Connection**:
```typescript
// Check if Phantom is installed
const isPhantomInstalled = window.solana?.isPhantom;

// Connect to wallet
const resp = await window.solana.connect();
const publicKey = resp.publicKey.toString();

// Sign transaction
const signedTx = await window.solana.signTransaction(transaction);
```

### 3. Solana Web3.js API

**Create Mint**:
```typescript
import { Connection, Keypair } from '@solana/web3.js';
import { createMint } from '@solana/spl-token';

const connection = new Connection('https://api.devnet.solana.com');

const mint = await createMint(
  connection,
  payer,        // Fee payer
  mintAuthority, // Mint authority
  null,         // Freeze authority (optional)
  0             // Decimals (0 for NFT)
);
```

**Create Metadata**:
```typescript
import { Metaplex } from '@metaplex-foundation/js';

const metaplex = Metaplex.make(connection);

await metaplex.nfts().create({
  uri: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
  name: 'Asset Name',
  sellerFeeBasisPoints: 0,
});
```

---

## 🎨 UI State Indicators

### Step Status Colors

```typescript
const statusColors = {
  pending: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    icon: 'border-gray-300',
  },
  processing: {
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    icon: 'text-blue-600 animate-spin',
  },
  completed: {
    bg: 'bg-green-50',
    text: 'text-green-900',
    icon: 'text-green-600',
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-900',
    icon: 'text-red-600',
  },
};
```

### Badge Variants

```typescript
const statusBadges = {
  pending: 'bg-gray-100 text-gray-800 border-gray-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  error: 'bg-red-100 text-red-800 border-red-200',
};
```

---

## 🔐 Security Architecture

### Client-Side Security

```
┌─────────────────────────────────────────────┐
│         Client-Side Security Layers         │
├─────────────────────────────────────────────┤
│                                             │
│  Layer 1: Input Validation                  │
│  ├─ Required field checks                   │
│  ├─ Data type validation                    │
│  ├─ String length limits                    │
│  └─ File type restrictions                  │
│                                             │
│  Layer 2: Sanitization                      │
│  ├─ HTML escape                             │
│  ├─ SQL injection prevention                │
│  └─ XSS protection                          │
│                                             │
│  Layer 3: Wallet Security                   │
│  ├─ Transaction signing required            │
│  ├─ User approval for each action           │
│  └─ No private key exposure                 │
│                                             │
└─────────────────────────────────────────────┘
```

### Data Privacy

```
┌──────────────────────────────────────────────┐
│              Data Visibility                 │
├──────────────────────────────────────────────┤
│                                              │
│  Public (On-Chain):                          │
│  ✓ Asset name                                │
│  ✓ Category                                  │
│  ✓ Mint address                              │
│  ✓ IPFS hash                                 │
│  ✓ Owner public key                          │
│                                              │
│  Semi-Public (IPFS):                         │
│  ✓ All metadata                              │
│  ✓ Asset image                               │
│  ✓ Attributes                                │
│                                              │
│  Private (Never Stored):                     │
│  ✗ Wallet private key                        │
│  ✗ Transaction passwords                     │
│  ✗ User authentication details               │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 📊 Performance Optimization

### Code Splitting

```typescript
// Lazy load AddAssetPage
const AddAssetPage = lazy(() => import('./components/AddAssetPage'));

// Usage in App.tsx
<Suspense fallback={<LoadingSpinner />}>
  <AddAssetPage />
</Suspense>
```

### Memoization

```typescript
// Memoize expensive calculations
const metadataJSON = useMemo(() => {
  return generateMetadata(formData);
}, [formData]);

// Memoize callbacks
const handleInputChange = useCallback(
  (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  },
  []
);
```

### Image Optimization

```typescript
// Compress image before upload
const compressImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Resize to max 1920x1920
        const maxSize = 1920;
        let width = img.width;
        let height = img.height;
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
describe('AddAssetPage Validation', () => {
  test('requires asset name', () => {
    const { result } = renderHook(() => useAssetForm());
    const errors = result.current.validate();
    expect(errors.name).toBe('Asset name is required');
  });
  
  test('requires category', () => {
    const { result } = renderHook(() => useAssetForm());
    const errors = result.current.validate();
    expect(errors.category).toBe('Category is required');
  });
});

describe('Minting Process', () => {
  test('updates step status correctly', async () => {
    const { result } = renderHook(() => useMinting());
    
    await result.current.startMinting(validFormData);
    
    expect(result.current.steps[0].status).toBe('completed');
    expect(result.current.steps[1].status).toBe('processing');
  });
});
```

### Integration Tests

```typescript
describe('Full Registration Flow', () => {
  test('completes asset registration', async () => {
    render(<AddAssetPage />);
    
    // Fill form
    await userEvent.type(
      screen.getByLabelText('Asset Name'),
      'Test Asset'
    );
    await userEvent.selectOptions(
      screen.getByLabelText('Category'),
      'Computers'
    );
    
    // Submit
    await userEvent.click(
      screen.getByText('Mint Asset on Blockchain')
    );
    
    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText(/Asset registered/i)).toBeInTheDocument();
    });
  });
});
```

---

## 📈 Monitoring & Analytics

### Metrics to Track

```typescript
// Track minting success rate
analytics.track('asset_minting_started', {
  category: formData.category,
  hasImage: !!selectedImage,
  timestamp: Date.now(),
});

analytics.track('asset_minting_completed', {
  assetId: mintedAssetId,
  duration: completionTime - startTime,
  stepsCompleted: 6,
});

analytics.track('asset_minting_failed', {
  failedStep: currentStep.id,
  errorMessage: error.message,
});
```

### Performance Monitoring

```typescript
// Track step durations
performance.mark('step_1_start');
// ... execute step 1
performance.mark('step_1_end');
performance.measure('step_1_duration', 'step_1_start', 'step_1_end');

// Report to analytics
const measure = performance.getEntriesByName('step_1_duration')[0];
analytics.track('step_duration', {
  step: 'validate_form',
  duration: measure.duration,
});
```

---

## 🔄 Error Handling Strategy

### Error Types & Recovery

```
┌─────────────────────────────────────────────┐
│            Error Handling Matrix            │
├──────────────┬──────────────────────────────┤
│ Error Type   │ Recovery Strategy            │
├──────────────┼──────────────────────────────┤
│ Validation   │ Show inline error, allow fix │
│ IPFS Upload  │ Retry with exponential delay │
│ Wallet       │ Prompt reconnection          │
│ Transaction  │ Show error, retry button     │
│ Network      │ Auto-retry 3x, then fail     │
│ Unknown      │ Log error, show generic msg  │
└──────────────┴──────────────────────────────┘
```

---

**Document Version**: 1.0  
**Last Updated**: October 28, 2025  
**Maintained By**: Solar Winds Architecture Team
