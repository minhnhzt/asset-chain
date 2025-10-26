# Pinata Integration Setup Checklist

## ✅ Completed (by AI Agent)

- [x] Created Pinata utility library (`app/lib/pinata.ts`)
- [x] Updated `RegisterAssetForm.tsx` for automatic IPFS upload
- [x] Updated `app/api/assets/route.ts` to work with Pinata CIDs
- [x] Updated `app/api/maintenance-logs/route.ts` for automatic upload
- [x] Created test endpoint (`app/api/ipfs/test/route.ts`)
- [x] Created comprehensive documentation (`PINATA_INTEGRATION.md`)
- [x] All TypeScript errors resolved
- [x] Environment configuration structure ready

## 🔲 Your Action Items

### 1. Get Pinata Credentials (5 minutes)

- [ ] Go to [https://pinata.cloud](https://pinata.cloud)
- [ ] Sign up / Log in
- [ ] Navigate to **API Keys** section
- [ ] Click **New Key**
- [ ] Enable permissions:
  - [x] `pinFileToIPFS`
  - [x] `pinJSONToIPFS`
  - [x] `unpin`
- [ ] Copy your credentials:
  - API Key: `___________________________`
  - API Secret: `___________________________`
  - JWT Token: `___________________________`

### 2. Configure Environment (2 minutes)

Your `.env.devnet` file already has the correct structure. You just need to:

- [ ] Copy `.env.devnet` to `.env.local`:
  ```bash
  cp .env.devnet .env.local
  ```

- [ ] Edit `.env.local` and replace placeholders:
  ```bash
  # Find these lines:
  PINATA_API_KEY=your_api_key_here
  PINATA_API_SECRET=your_api_secret_here
  PINATA_JWT=your_jwt_token_here
  
  # Replace with your actual credentials from step 1
  ```

- [ ] Save the file

**Important:** Never commit `.env.local` to git (it's already in `.gitignore`)

### 3. Test Connection (1 minute)

- [ ] Start development server:
  ```bash
  yarn dev
  ```

- [ ] In another terminal, test Pinata connection:
  ```bash
  curl http://localhost:3000/api/ipfs/test
  ```

- [ ] Expected response:
  ```json
  {
    "success": true,
    "message": "Pinata connection successful",
    "connected": true
  }
  ```

- [ ] If you get an error, double-check your credentials in `.env.local`

### 4. Test Asset Registration (3 minutes)

- [ ] Open browser: `http://localhost:3000/dashboard`
- [ ] Connect your Phantom wallet
- [ ] Fill in the registration form:
  - Asset Name: `Test Asset 001`
  - Location: `Test Location`
  - Description: `This is a test asset`
  - Category: Select any category
  - Image URL: (optional)
- [ ] Click "Register Asset"
- [ ] Watch for upload progress messages:
  - "Uploading metadata to IPFS..."
  - "Metadata uploaded successfully!"
  - "Registering asset on blockchain..."
- [ ] Check Pinata dashboard to see your uploaded metadata

### 5. Verify on Pinata Dashboard (2 minutes)

- [ ] Go to Pinata dashboard: [https://app.pinata.cloud/pinmanager](https://app.pinata.cloud/pinmanager)
- [ ] You should see a new file: `asset-test-asset-001.json`
- [ ] Click on the file to view its contents
- [ ] Copy the IPFS hash (CID) - it starts with `Qm...` or `bafy...`
- [ ] Test the public URL:
  ```
  https://gateway.pinata.cloud/ipfs/<YOUR_CID_HERE>
  ```

## 🎉 Success Criteria

You'll know everything is working when:

✅ Test connection returns `"connected": true`
✅ Asset registration shows upload progress
✅ No errors in browser console
✅ File appears in Pinata dashboard
✅ Public IPFS URL returns your metadata JSON

## 🐛 Troubleshooting

### Issue: "401 Unauthorized"
**Solution:** Double-check your JWT token in `.env.local`

### Issue: "403 Forbidden"
**Solution:** Ensure API key has `pinJSONToIPFS` permission enabled

### Issue: "Cannot find Pinata credentials"
**Solution:** 
1. Make sure `.env.local` exists (not `.env.devnet`)
2. Restart dev server after editing `.env.local`

### Issue: "CORS error in browser"
**Solution:** This is expected - uploads go through Next.js API routes, not directly from browser

### Issue: Connection test passes but registration fails
**Solution:**
1. Check browser console for detailed error
2. Verify wallet is connected
3. Check you have SOL in wallet for transaction fees

## 📚 Next Steps

After successful setup:

1. **Read the full documentation:** `PINATA_INTEGRATION.md`
2. **Explore Pinata functions:** Check `app/lib/pinata.ts` for all available functions
3. **Test maintenance logs:** Create a maintenance log for your test asset
4. **Deploy to production:** See production recommendations in `PINATA_INTEGRATION.md`

## 💡 Quick Reference

### Import Pinata Functions
```typescript
import { 
  uploadAssetMetadata,
  uploadMaintenanceDetails,
  getIPFSUrl,
  testPinataConnection 
} from '@/app/lib/pinata';
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

## ✅ Completion Checklist

Mark each item as you complete it:

- [ ] Pinata account created
- [ ] API credentials obtained
- [ ] `.env.local` configured
- [ ] Connection test passed
- [ ] Test asset registered
- [ ] Metadata visible on Pinata
- [ ] Public URL accessible
- [ ] Ready for production!

---

**Time to complete:** ~15 minutes
**Difficulty:** Easy
**Documentation:** PINATA_INTEGRATION.md

Need help? Check the troubleshooting section or review the full documentation.
