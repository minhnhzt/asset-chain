# Add Asset - Quick Start Guide

## 🚀 Getting Started (3 Steps)

### Step 1: Fill Required Fields
- ✅ **Asset Name** (e.g., "MacBook Pro 16")
- ✅ **Category** (Select from dropdown)

### Step 2: Add Optional Details
- Purchase value, date, warranty
- Location and assignment
- Serial number, manufacturer, model
- Upload photo (optional)

### Step 3: Mint on Blockchain
- Click **"Mint Asset on Blockchain"**
- Wait ~10 seconds for completion
- View success confirmation

---

## 📝 Quick Form Reference

| Field | Required | Example |
|-------|----------|---------|
| Asset Name | ✅ Yes | MacBook Pro 16 |
| Category | ✅ Yes | Computers |
| Description | No | High-performance laptop |
| Serial Number | No | SN123456789 |
| Purchase Value | No | 2500 |
| Location | No | Office Floor 3 |
| Assigned To | No | John Doe |

---

## 🔄 Minting Process

```
1. Validate Form       [0.8s]  ✓ Check required fields
2. Upload to IPFS      [2.0s]  ✓ Store metadata on Pinata
3. Connect Wallet      [1.5s]  ✓ Connect Phantom
4. Mint SPL Token      [3.0s]  ✓ Create on Solana devnet
5. Record Metadata     [2.0s]  ✓ Link IPFS to token
6. Finalize            [1.0s]  ✓ Generate Asset ID
                       ------
Total: ~10.3 seconds
```

---

## 💰 Cost Breakdown

| Item | Cost |
|------|------|
| Mint Account | $0.0003 |
| Metadata | $0.0012 |
| Token Account | $0.0004 |
| **Total** | **~$0.0019** |

---

## ✅ Success Indicators

After minting, you'll see:

✓ **Asset ID** (e.g., ASSET-123456)  
✓ **SPL Token Mint Address** (link to Solana Explorer)  
✓ **IPFS Metadata Hash** (link to IPFS Gateway)  
✓ **Asset Status**: ACTIVE

---

## 🔗 Useful Links

- **Solana Explorer**: https://explorer.solana.com
- **IPFS Gateway**: https://gateway.pinata.cloud/ipfs
- **Phantom Wallet**: https://phantom.app

---

## ⚡ Common Issues

### "Wallet not connected"
→ Install Phantom wallet and refresh

### "Insufficient SOL"
→ Get devnet SOL: https://faucet.solana.com

### "IPFS upload failed"
→ Check internet connection

---

## 📚 Full Documentation

For detailed information, see:
- [`/documentation/ADD_ASSET_GUIDE.md`](./ADD_ASSET_GUIDE.md)
- [Solana SPL Token Docs](https://spl.solana.com/token)
- [Pinata API Docs](https://docs.pinata.cloud/)

---

**Need Help?** Check the troubleshooting section in the full guide or contact support.
