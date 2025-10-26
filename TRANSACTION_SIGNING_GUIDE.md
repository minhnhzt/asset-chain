# Transaction Signing Implementation Guide

## Overview

This guide explains how wallet connection and transaction signing are implemented in the Solana Asset Manager application.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  Wallet Provider (Root Level)                   │
│  - Manages wallet connection state                              │
│  - Provides wallet context to all components                    │
│  - Handles auto-connect                                         │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│            WalletConnectButton Component                        │
│  - Displays connection UI                                       │
│  - Shows wallet address & balance                               │
│  - Connect/disconnect button                                    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│          useTransactionSigner Hook                              │
│  - registerAsset()                                              │
│  - addMaintenanceLog()                                          │
│  - updateAssetStatus()                                          │
│  - signAndSendTransaction()                                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│           Solana Program (On-Chain)                             │
│  - Executes instructions                                        │
│  - Updates blockchain state                                     │
│  - Emits events                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. Wallet Provider Setup

**File:** `app/providers/WalletProvider.tsx`

Wraps the application with Solana wallet adapter providers:

```typescript
import { SolanaWalletProvider } from '@/app/providers/WalletProvider';

// In your layout or page
<SolanaWalletProvider>
  {children}
</SolanaWalletProvider>
```

**Features:**
- Automatic wallet detection (Phantom)
- Auto-connect on page load
- Connection state management
- Modal UI for wallet selection

### 2. Wallet Connection UI

**File:** `app/components/WalletConnectButton.tsx`

Displays wallet connection status and balance:

```typescript
import { WalletConnectButton } from '@/app/components/WalletConnectButton';

// In your component
<WalletConnectButton />
```

**Features:**
- Connect/disconnect button
- Displays wallet address (shortened)
- Shows SOL balance
- Wallet icon display
- Responsive design
- Dark theme optimized

### 3. Transaction Signing Hook

**File:** `app/hooks/useTransactionSigner.ts`

Provides transaction signing utilities:

```typescript
import { useTransactionSigner } from '@/app/hooks/useTransactionSigner';

function MyComponent() {
  const { registerAsset, isConnected, publicKey } = useTransactionSigner();

  const handleRegister = async () => {
    try {
      const signature = await registerAsset(name, location, metadataCid);
      console.log('Transaction signature:', signature);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };
}
```

**Available Functions:**

#### `registerAsset(name, location, metadataCid)`
Registers a new asset on the blockchain.

**Parameters:**
- `name: string` - Asset name (max 128 chars)
- `location: string` - Asset location (max 256 chars)
- `metadataCid: string` - IPFS metadata CID (max 64 chars)

**Returns:** `Promise<string>` - Transaction signature

**Example:**
```typescript
const signature = await registerAsset(
  'Forklift #123',
  'Warehouse A',
  'QmT5NvU...'
);
```

#### `addMaintenanceLog(assetPubkey, note, ipfsCid, performerPubkey)`
Adds a maintenance log entry for an asset.

**Parameters:**
- `assetPubkey: PublicKey` - Asset's public key
- `note: string` - Short note (max 128 chars)
- `ipfsCid: string` - IPFS CID for detailed log
- `performerPubkey: PublicKey` - Technician's public key

**Returns:** `Promise<string>` - Transaction signature

**Example:**
```typescript
const signature = await addMaintenanceLog(
  new PublicKey('Asset...'),
  'Oil change completed',
  'QmABC...',
  new PublicKey('Technician...')
);
```

#### `updateAssetStatus(assetPubkey, newStatus)`
Updates an asset's status.

**Parameters:**
- `assetPubkey: PublicKey` - Asset's public key
- `newStatus: number` - New status (0=ACTIVE, 1=MAINTENANCE, 2=RETIRED, 3=DISPOSED)

**Returns:** `Promise<string>` - Transaction signature

**Example:**
```typescript
const signature = await updateAssetStatus(
  new PublicKey('Asset...'),
  1 // MAINTENANCE
);
```

#### `signAndSendTransaction(transaction)`
Generic function to sign and send any transaction.

**Parameters:**
- `transaction: Transaction` - Solana transaction object

**Returns:** `Promise<string>` - Transaction signature

**Example:**
```typescript
const tx = new Transaction().add(instruction);
const signature = await signAndSendTransaction(tx);
```

### 4. Complete Registration Flow

**File:** `app/components/RegisterAssetForm.tsx`

Shows complete implementation with Pinata upload and transaction signing:

```typescript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // Step 1: Upload metadata to IPFS via Pinata
    setUploadProgress('Uploading metadata to IPFS...');
    const metadataCid = await uploadAssetMetadata({
      name,
      location,
      description,
      category,
      image,
    });
    
    // Step 2: Register on blockchain
    setUploadProgress('Registering asset on blockchain...');
    const signature = await registerAsset(name, location, metadataCid);
    
    // Step 3: Show success with explorer link
    setMessage({
      type: 'success',
      text: `Asset registered! Transaction: ${signature}`
    });
    
    // Link to Solana Explorer
    const explorerUrl = getExplorerUrl(signature, 'tx');
  } catch (error) {
    setMessage({ type: 'error', text: error.message });
  }
};
```

**Flow:**
1. User fills form
2. Click "Register Asset"
3. Frontend uploads metadata to Pinata (automatic)
4. Frontend calls `registerAsset()` with IPFS CID
5. Phantom wallet popup appears for transaction approval
6. User approves transaction
7. Transaction sent to Solana network
8. Transaction confirmed
9. Success message with Solana Explorer link

## Error Handling

### Common Errors

**"Wallet not connected"**
```typescript
if (!isConnected) {
  alert('Please connect your wallet first');
  return;
}
```

**"User rejected transaction"**
```typescript
try {
  const signature = await registerAsset(...);
} catch (error) {
  if (error.message.includes('User rejected')) {
    alert('Transaction cancelled by user');
  }
}
```

**"Insufficient funds"**
```typescript
try {
  const signature = await registerAsset(...);
} catch (error) {
  if (error.message.includes('insufficient')) {
    alert('Not enough SOL for transaction fees');
  }
}
```

**"Account already exists"**
```typescript
try {
  const signature = await registerAsset(...);
} catch (error) {
  if (error.message.includes('already in use')) {
    alert('Asset with this name already exists');
  }
}
```

### Error Handling Pattern

```typescript
const { registerAsset } = useTransactionSigner();
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

const handleRegister = async () => {
  setError(null);
  setLoading(true);
  
  try {
    const signature = await registerAsset(name, location, cid);
    console.log('Success:', signature);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    setError(message);
    console.error('Transaction failed:', err);
  } finally {
    setLoading(false);
  }
};
```

## Transaction Confirmation

### Getting Transaction Status

```typescript
import { confirmTransaction } from '@/app/lib/blockchain';
import { useConnection } from '@solana/wallet-adapter-react';

const { connection } = useConnection();

// After sending transaction
const signature = await registerAsset(...);

// Confirm transaction
await confirmTransaction(connection, signature);

console.log('Transaction confirmed!');
```

### Viewing on Explorer

```typescript
import { getExplorerUrl } from '@/app/config/solana';

// Get explorer URL for transaction
const explorerUrl = getExplorerUrl(signature, 'tx');

// Display link
<a href={explorerUrl} target="_blank">
  View on Solana Explorer
</a>
```

## Testing

### Manual Testing Checklist

1. **Wallet Connection**
   - [ ] Click "Connect Wallet" button
   - [ ] Phantom wallet popup appears
   - [ ] Approve connection
   - [ ] Wallet address displayed
   - [ ] SOL balance shown
   - [ ] Disconnect works

2. **Asset Registration**
   - [ ] Fill registration form
   - [ ] Click "Register Asset"
   - [ ] IPFS upload progress shown
   - [ ] Transaction approval popup appears
   - [ ] Approve transaction
   - [ ] Success message displayed
   - [ ] Transaction signature shown
   - [ ] Explorer link works

3. **Error Handling**
   - [ ] Try register without wallet connected
   - [ ] Try register with invalid data
   - [ ] Reject transaction in wallet
   - [ ] Try with insufficient SOL
   - [ ] All errors handled gracefully

### Test Accounts

**Devnet Test Wallet:**
- Get devnet SOL: https://faucet.solana.com
- Required: ~0.01 SOL per transaction

## Best Practices

### 1. Always Check Wallet Connection

```typescript
const { isConnected, publicKey } = useTransactionSigner();

if (!isConnected || !publicKey) {
  return <div>Please connect your wallet</div>;
}
```

### 2. Show Loading States

```typescript
const [loading, setLoading] = useState(false);

return (
  <button disabled={loading}>
    {loading ? 'Processing...' : 'Register Asset'}
  </button>
);
```

### 3. Provide Transaction Feedback

```typescript
// Show progress
setProgress('Uploading to IPFS...');
setProgress('Signing transaction...');
setProgress('Confirming transaction...');
setProgress('Success!');

// Show result
console.log('Transaction signature:', signature);
console.log('Explorer:', getExplorerUrl(signature, 'tx'));
```

### 4. Handle Network Changes

```typescript
import { SOLANA_CONFIG } from '@/app/config/solana';

console.log('Connected to:', SOLANA_CONFIG.network);
console.log('RPC URL:', SOLANA_CONFIG.rpcUrl);
```

## Security Considerations

### 1. Never Store Private Keys

✅ **Correct:** Use wallet adapter (user controls keys)
❌ **Wrong:** Store or transmit private keys

### 2. Validate Inputs

```typescript
if (name.length > 128) {
  throw new Error('Name too long');
}

if (location.length > 256) {
  throw new Error('Location too long');
}

if (metadataCid.length > 64) {
  throw new Error('CID too long');
}
```

### 3. Confirm Transactions

```typescript
// Always confirm before showing success
await confirmTransaction(connection, signature);
```

### 4. Use Correct Network

```typescript
// Check you're on the right network
const network = SOLANA_CONFIG.network;
if (network !== 'devnet' && !isProduction) {
  console.warn('Not on devnet!');
}
```

## Troubleshooting

### Phantom Not Detected

```typescript
// Check if Phantom is installed
if (!window.solana?.isPhantom) {
  alert('Please install Phantom wallet');
  window.open('https://phantom.app', '_blank');
}
```

### Transaction Fails Silently

```typescript
// Enable debug mode
// In .env.local
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_SHOW_TRANSACTION_LOGS=true

// Check console for detailed errors
```

### Slow Confirmations

```typescript
// Use confirmed commitment for faster feedback
const provider = new AnchorProvider(
  connection,
  wallet,
  { commitment: 'confirmed' } // Instead of 'finalized'
);
```

## Next Steps

1. **Implement Maintenance Logs UI** - Use `addMaintenanceLog()`
2. **Add Status Updates** - Use `updateAssetStatus()`
3. **Create Transaction History** - Fetch past transactions
4. **Add Real-Time Monitoring** - WebSocket for tx updates
5. **Batch Operations** - Multiple transactions in one flow

## Resources

- **Solana Web3.js Docs:** https://solana-labs.github.io/solana-web3.js
- **Wallet Adapter Docs:** https://github.com/solana-labs/wallet-adapter
- **Anchor Docs:** https://www.anchor-lang.com
- **Phantom Wallet:** https://phantom.app/learn/developers

---

**Status:** ✅ Wallet connection and transaction signing fully implemented!

**Files:**
- `app/providers/WalletProvider.tsx` - Wallet context provider
- `app/hooks/useTransactionSigner.ts` - Transaction signing hook
- `app/components/WalletConnectButton.tsx` - Connection UI
- `app/components/RegisterAssetForm.tsx` - Complete implementation example

All code is production-ready and follows Solana best practices.
