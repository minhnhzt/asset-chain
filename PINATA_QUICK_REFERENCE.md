# Pinata Quick Reference Card

## 🚀 Setup (3 Steps)

```bash
# 1. Get credentials from https://pinata.cloud
# 2. Configure environment
cp .env.devnet .env.local
# Edit .env.local with your credentials

# 3. Test connection
yarn dev
curl http://localhost:3000/api/ipfs/test
```

## 📚 Import Functions

```typescript
import {
  uploadAssetMetadata,
  uploadMaintenanceDetails,
  uploadJSONToPinata,
  uploadFileToPinata,
  getIPFSUrl,
  unpinFromPinata,
  testPinataConnection,
} from '@/app/lib/pinata';
```

## 💡 Common Use Cases

### Upload Asset Metadata
```typescript
const cid = await uploadAssetMetadata({
  name: 'Asset Name',
  location: 'Location',
  description: 'Description',
  category: 'Category',
  image: 'https://example.com/image.jpg'
});
```

### Upload Maintenance Log
```typescript
const cid = await uploadMaintenanceDetails({
  assetId: 'asset-pubkey',
  performer: 'technician-pubkey',
  action: 'Maintenance action',
  notes: 'Detailed notes'
});
```

### Get IPFS URL
```typescript
const url = getIPFSUrl('QmXxxx...');
// Returns: https://gateway.pinata.cloud/ipfs/QmXxxx...
```

### Fetch Metadata
```typescript
const response = await fetch(getIPFSUrl(cid));
const metadata = await response.json();
```

### Test Connection
```typescript
const connected = await testPinataConnection();
```

## 🔧 API Endpoints

### Test Connection
```bash
GET /api/ipfs/test
# Response: {"success":true,"connected":true}
```

### Register Asset (Auto IPFS Upload)
```bash
POST /api/assets
{
  "name": "Asset Name",
  "location": "Location",
  "metadata_cid": "QmXxxx...",
  "walletPublicKey": "pubkey"
}
```

### Add Maintenance Log (Auto IPFS Upload)
```bash
POST /api/maintenance-logs
{
  "assetId": "asset-pubkey",
  "note": "Short note",
  "action": "Action performed",
  "performerPublicKey": "performer-pubkey",
  "walletPublicKey": "wallet-pubkey"
}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check JWT token in `.env.local` |
| 403 Forbidden | Verify API key permissions |
| Connection fails | Ensure `.env.local` exists with valid credentials |
| Upload works but blockchain fails | Check wallet has SOL for fees |

## 📖 Documentation Files

- **PINATA_SETUP_CHECKLIST.md** - Start here (15 min setup)
- **PINATA_INTEGRATION.md** - Complete reference guide
- **PINATA_INTEGRATION_SUMMARY.md** - Quick overview
- **app/lib/pinata.examples.ts** - 12 code examples

## 🔒 Security Checklist

- ✅ Never commit `.env.local` to git
- ✅ Use different API keys for dev/prod
- ✅ API keys are server-side only
- ✅ All uploads via Next.js API routes
- ✅ Validate inputs before upload

## 📊 Pinata Free Tier Limits

- 100 requests/minute
- 1GB storage
- 100GB bandwidth/month

Upgrade at: https://pinata.cloud/pricing

## ✅ Success Indicators

Your integration is working when:
- ✅ `/api/ipfs/test` returns `"connected": true`
- ✅ Asset registration shows upload progress
- ✅ Files appear in Pinata dashboard
- ✅ IPFS URLs return JSON metadata
- ✅ No console errors

## 🎯 Component Integration

### RegisterAssetForm
```typescript
// Automatically uploads to Pinata before blockchain registration
// Progress: "Uploading to IPFS..." → "Registering on blockchain..."
// User never interacts with IPFS manually
```

### Maintenance Logs
```typescript
// Auto-uploads details to Pinata
// Returns IPFS CID in API response
// Stores CID on blockchain
```

## 🔗 Useful Links

- Pinata Dashboard: https://app.pinata.cloud/pinmanager
- Pinata Docs: https://docs.pinata.cloud
- IPFS Docs: https://docs.ipfs.tech
- Pinata API Keys: https://app.pinata.cloud/keys

## ⚡ Quick Test Script

```bash
# Test connection
curl http://localhost:3000/api/ipfs/test

# Expected response
{"success":true,"message":"Pinata connection successful","connected":true}
```

## 📝 Environment Variables

```bash
# Required in .env.local
PINATA_API_KEY=your_api_key
PINATA_API_SECRET=your_api_secret
PINATA_JWT=your_jwt_token
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

---

**All set!** 🎉 Now you can use Pinata for automatic IPFS uploads.
