# Pinata IPFS Integration Guide

## Overview

This project uses **Pinata** as the IPFS provider for storing asset metadata and maintenance log details off-chain. All metadata is automatically uploaded to IPFS via Pinata before blockchain registration.

## Architecture

### Hybrid Storage Model

- **On-Chain (Solana):** Immutable references (IPFS CID), asset status, timestamps
- **Off-Chain (IPFS via Pinata):** Detailed metadata JSON (name, description, images, attributes)

**Benefits:**
- Reduces on-chain storage costs
- Allows metadata updates without blockchain transactions
- Maintains immutability proof via CID
- Better scalability for large metadata

## Setup

### 1. Get Pinata Credentials

1. Sign up at [https://pinata.cloud](https://pinata.cloud)
2. Navigate to **API Keys** section
3. Create a new API key with the following permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
   - `unpin`
4. Save your credentials:
   - **API Key**
   - **API Secret**
   - **JWT Token**

### 2. Configure Environment Variables

Update `.env.devnet` (or `.env.local` for local development):

```bash
# IPFS Configuration (Pinata)
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
PINATA_API_KEY=your_api_key_here
PINATA_API_SECRET=your_api_secret_here
PINATA_JWT=your_jwt_token_here
```

**Important:** Never commit actual credentials to git. The `.env.devnet` file contains placeholders.

### 3. Test Connection

```bash
# Start the development server
yarn dev

# Test Pinata connection
curl http://localhost:3000/api/ipfs/test
```

Expected response:
```json
{
  "success": true,
  "message": "Pinata connection successful",
  "connected": true
}
```

## Usage

### Asset Registration with Automatic IPFS Upload

The `RegisterAssetForm` component automatically uploads metadata to IPFS before blockchain registration:

```typescript
// User fills form with:
// - Name: "Forklift #123"
// - Location: "Warehouse A"
// - Description: "Heavy-duty forklift"
// - Category: "Equipment"
// - Image URL: "https://example.com/forklift.jpg"

// On submit:
// 1. Metadata is uploaded to Pinata
const ipfsCid = await uploadAssetMetadata({
  name: "Forklift #123",
  location: "Warehouse A",
  description: "Heavy-duty forklift",
  category: "Equipment",
  image: "https://example.com/forklift.jpg",
  attributes: [
    { trait_type: "Location", value: "Warehouse A" },
    { trait_type: "Category", value: "Equipment" }
  ]
});

// 2. CID is stored on-chain
await program.methods.registerAsset(
  "Forklift #123",
  "Warehouse A", 
  ipfsCid
).rpc();
```

### Maintenance Log Upload

```typescript
// When creating a maintenance log:
const ipfsCid = await uploadMaintenanceDetails({
  assetId: "asset-pubkey",
  performer: "technician-pubkey",
  action: "Routine inspection",
  notes: "All systems operational",
  timestamp: new Date().toISOString()
});

// CID is stored on-chain
await program.methods.addMaintenanceLog(
  note,
  ipfsCid
).rpc();
```

### Retrieving Metadata

```typescript
import { getIPFSUrl } from '@/app/lib/pinata';

// Get public URL for an IPFS hash
const metadataUrl = getIPFSUrl('QmXxxx...');
// Returns: https://gateway.pinata.cloud/ipfs/QmXxxx...

// Fetch the metadata
const response = await fetch(metadataUrl);
const metadata = await response.json();
```

## API Functions

### `uploadAssetMetadata(metadata)`

Upload asset metadata to Pinata with automatic formatting.

**Parameters:**
```typescript
{
  name: string;           // Required: Asset name
  location: string;       // Required: Physical location
  description?: string;   // Optional: Detailed description
  category?: string;      // Optional: Asset category
  image?: string;         // Optional: Image URL
  attributes?: Array<{    // Optional: Custom attributes
    trait_type: string;
    value: string;
  }>;
}
```

**Returns:** `Promise<string>` - IPFS CID

**Example:**
```typescript
const cid = await uploadAssetMetadata({
  name: 'Server Rack A1',
  location: 'Data Center, Floor 2',
  description: 'Production server rack',
  category: 'Equipment',
  image: 'https://example.com/rack.jpg',
  attributes: [
    { trait_type: 'Capacity', value: '42U' },
    { trait_type: 'Power', value: '5kW' }
  ]
});
```

### `uploadMaintenanceDetails(details)`

Upload maintenance log details to Pinata.

**Parameters:**
```typescript
{
  assetId: string;        // Required: Asset public key
  performer: string;      // Required: Technician public key
  action: string;         // Required: Action performed
  notes: string;          // Required: Detailed notes
  timestamp?: string;     // Optional: ISO timestamp (defaults to now)
}
```

**Returns:** `Promise<string>` - IPFS CID

**Example:**
```typescript
const cid = await uploadMaintenanceDetails({
  assetId: 'AssetPubkey...',
  performer: 'TechnicianPubkey...',
  action: 'Annual maintenance',
  notes: 'Replaced filters, checked all systems'
});
```

### `uploadJSONToPinata(json, filename)`

Generic function to upload any JSON to Pinata.

**Parameters:**
- `json: object` - JSON object to upload
- `filename: string` - Filename for the uploaded content

**Returns:** `Promise<PinataResponse>` - Full Pinata API response with `IpfsHash`, `PinSize`, etc.

### `uploadFileToPinata(file, filename)`

Upload files (images, documents) to Pinata.

**Parameters:**
- `file: Buffer | Blob` - File content
- `filename: string` - Filename

**Returns:** `Promise<PinataResponse>` - Full Pinata API response

### `getIPFSUrl(ipfsHash)`

Get the public URL for an IPFS hash.

**Parameters:**
- `ipfsHash: string` - IPFS CID (with or without `ipfs://` prefix)

**Returns:** `string` - Public gateway URL

### `unpinFromPinata(ipfsHash)`

Unpin a file from Pinata (to manage storage).

**Parameters:**
- `ipfsHash: string` - IPFS CID to unpin

**Returns:** `Promise<boolean>` - Success status

### `testPinataConnection()`

Test Pinata connection and credentials.

**Returns:** `Promise<boolean>` - Connection status

## Updated Components

### RegisterAssetForm

**Location:** `app/components/RegisterAssetForm.tsx`

**Changes:**
- Removed manual IPFS CID input field
- Added description, category, and image URL fields
- Automatic Pinata upload before blockchain registration
- Upload progress indicator
- Better user experience (no need to manually upload to IPFS)

**New Fields:**
- Description (optional)
- Category dropdown (optional)
- Image URL (optional)

### API Routes

#### POST /api/assets

**Changes:**
- Expects `metadata_cid` from Pinata upload
- Validates CID length (max 64 characters for optimized on-chain storage)

#### POST /api/maintenance-logs

**Changes:**
- Automatically uploads details to Pinata
- Returns `ipfsCid` in response
- Removed manual `ipfs_cid` input requirement
- Added `action` field for maintenance type

**New Request Body:**
```json
{
  "assetId": "asset-pubkey",
  "note": "Short note (max 128 chars)",
  "action": "Maintenance action performed",
  "performerPublicKey": "performer-pubkey",
  "walletPublicKey": "wallet-pubkey"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Maintenance log entry added successfully",
  "data": {
    "performer": "performer-pubkey",
    "note": "Short note",
    "timestamp": 1698765432,
    "ipfs_cid": "QmXxxx..."
  },
  "ipfsCid": "QmXxxx...",
  "transactionRequired": true,
  "instruction": "add_maintenance_log"
}
```

#### GET /api/ipfs/test

**New endpoint** to test Pinata connection.

**Response:**
```json
{
  "success": true,
  "message": "Pinata connection successful",
  "connected": true
}
```

## File Structure

```
app/
├── lib/
│   └── pinata.ts                    # Pinata utility functions
├── api/
│   ├── assets/route.ts              # Updated: Uses Pinata CIDs
│   ├── maintenance-logs/route.ts    # Updated: Auto-uploads to Pinata
│   └── ipfs/
│       └── test/route.ts            # New: Test Pinata connection
├── components/
│   └── RegisterAssetForm.tsx        # Updated: Auto Pinata upload
└── config/
    └── solana.ts                    # Updated: Pinata config
```

## Best Practices

### 1. Metadata Structure

Always include these fields in asset metadata:
```json
{
  "name": "Asset name",
  "description": "Detailed description",
  "location": "Physical location",
  "category": "Asset category",
  "image": "Image URL (optional)",
  "attributes": [
    { "trait_type": "Custom field", "value": "Value" }
  ],
  "created_at": "ISO 8601 timestamp"
}
```

### 2. Error Handling

```typescript
try {
  const cid = await uploadAssetMetadata(metadata);
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('401')) {
      // Invalid credentials
    } else if (error.message.includes('403')) {
      // Insufficient permissions
    } else {
      // Other error
    }
  }
}
```

### 3. Rate Limiting

Pinata free tier limits:
- 100 requests/minute
- 1GB storage
- 100GB bandwidth/month

**Recommendation:** Implement client-side debouncing and caching for production.

### 4. CID Validation

```typescript
// Valid IPFS CID formats:
// - Qm... (CIDv0, 46 characters)
// - bafy... (CIDv1, variable length)

function isValidCID(cid: string): boolean {
  return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[0-9a-z]{50,})$/.test(cid);
}
```

## Troubleshooting

### Issue: "Pinata connection failed"

**Solution:**
1. Verify credentials in `.env.devnet`
2. Test with: `curl http://localhost:3000/api/ipfs/test`
3. Check Pinata dashboard for API key status
4. Ensure API key has correct permissions

### Issue: "401 Unauthorized"

**Solution:**
- JWT token may be expired
- Generate new API key from Pinata dashboard
- Update `.env.devnet` with new credentials

### Issue: "Upload too large"

**Solution:**
- Pinata free tier: max 100MB per file
- Compress images before upload
- Consider upgrading Pinata plan

### Issue: "Cannot fetch metadata"

**Solution:**
- Verify IPFS gateway URL is correct
- Try alternative gateway: `https://ipfs.io/ipfs/`
- Check if CID is pinned on Pinata dashboard

## Testing

### Unit Tests

```bash
# Test Pinata utility functions
yarn test app/lib/pinata.test.ts
```

### Integration Tests

```bash
# Start dev server
yarn dev

# Test asset registration flow
curl -X POST http://localhost:3000/api/assets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Asset",
    "location": "Test Location",
    "metadata_cid": "QmTest...",
    "walletPublicKey": "PublicKey..."
  }'

# Test maintenance log
curl -X POST http://localhost:3000/api/maintenance-logs \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "AssetPubkey...",
    "note": "Test maintenance",
    "action": "Testing",
    "performerPublicKey": "PerformerPubkey...",
    "walletPublicKey": "WalletPubkey..."
  }'
```

## Security Considerations

### Environment Variables

- **Never commit** real credentials to git
- Use different API keys for dev/staging/production
- Rotate keys regularly
- Use `.env.local` for local development (git-ignored)

### Access Control

- Pinata API keys are server-side only (not exposed to client)
- Client cannot directly upload to Pinata
- All uploads go through Next.js API routes
- Implement rate limiting in production

### Metadata Validation

- Sanitize user inputs before upload
- Validate file types for image uploads
- Limit metadata size to prevent abuse
- Check content before pinning

## Production Recommendations

### 1. Upgrade Pinata Plan

For production, consider:
- **Picnic Plan** ($20/mo): 50GB storage, 500GB bandwidth
- **Custom Plan**: Contact Pinata for enterprise needs

### 2. Implement Caching

```typescript
// Cache metadata locally to reduce Pinata requests
const cache = new Map<string, any>();

async function getCachedMetadata(cid: string) {
  if (cache.has(cid)) {
    return cache.get(cid);
  }
  
  const metadata = await fetch(getIPFSUrl(cid)).then(r => r.json());
  cache.set(cid, metadata);
  return metadata;
}
```

### 3. Use Dedicated Gateway

For better performance:
- Set up dedicated Pinata gateway
- Update `NEXT_PUBLIC_IPFS_GATEWAY` in config

### 4. Monitor Usage

- Track upload volume
- Monitor bandwidth usage
- Set up alerts for quota limits
- Review Pinata analytics dashboard

## Next Steps

1. **Add your Pinata credentials** to `.env.devnet`
2. **Test connection**: Visit http://localhost:3000/api/ipfs/test
3. **Register a test asset** via dashboard
4. **Verify metadata** on Pinata dashboard
5. **Check IPFS CID** is stored on blockchain

## Support

- **Pinata Documentation:** https://docs.pinata.cloud
- **IPFS Documentation:** https://docs.ipfs.tech
- **Project Issues:** [GitHub Issues](https://github.com/your-repo/issues)
