# Add Asset Feature - Complete Guide

## 🎯 Overview

The **Add Asset** feature allows SMBs to register physical assets on the Solana blockchain, creating an immutable, fraud-proof audit trail with decentralized ownership at minimal cost (~$0.0003 per asset).

## ✨ Key Features

### 1. Comprehensive Asset Registration
- **Basic Information**: Name, category, description, serial number
- **Manufacturer Details**: Manufacturer, model number
- **Financial Data**: Purchase value, purchase date, warranty expiry
- **Location & Assignment**: Physical location, assigned user
- **Additional Notes**: Custom fields for extra information
- **Image Upload**: Optional photo attachment

### 2. Blockchain Minting Process
```
Form Validation → IPFS Upload → Wallet Connection → SPL Token Mint → On-Chain Recording → Finalize
```

### 3. SPL Token Standard
- **0-decimal tokens** (1 token = 1 asset)
- **NFT-style uniqueness** (each asset is unique)
- **Metaplex compatible** metadata structure
- **Low cost**: ~$0.0003 per mint

### 4. IPFS Integration
- **Pinata API** for distributed metadata storage
- **Permanent URLs** for asset images and metadata
- **Decentralized storage** - no single point of failure

---

## 📋 Form Fields

### Required Fields (*)
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| Asset Name * | Text | Descriptive name | "MacBook Pro 16" |
| Category * | Select | Asset type | "Computers", "Furniture", etc. |

### Optional Fields
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| Description | Textarea | Detailed description | "High-performance laptop for dev team" |
| Serial Number | Text | Manufacturer serial | "SN123456789" |
| Manufacturer | Text | Brand/maker | "Apple" |
| Model | Text | Model identifier | "MacBook Pro 2023" |
| Purchase Value | Number | Cost in USD | "2500" |
| Purchase Date | Date | Acquisition date | "2025-01-15" |
| Warranty Expiry | Date | Warranty end date | "2028-01-15" |
| Location | Text | Physical location | "Office Floor 3" |
| Assigned To | Text | Current user | "John Doe" |
| Notes | Textarea | Additional info | "Includes AppleCare+" |
| Image | File | Asset photo | JPG, PNG (optional) |

### Category Options
- **Computers**: Laptops, desktops, tablets
- **Furniture**: Desks, chairs, cabinets
- **Equipment**: Tools, machinery, devices
- **Vehicles**: Cars, trucks, forklifts
- **Tools**: Hand tools, power tools
- **Electronics**: Monitors, printers, scanners
- **Other**: Miscellaneous items

---

## 🔄 Minting Process (6 Steps)

### Step 1: Validate Form Data
**Duration**: ~0.8 seconds  
**Action**: Validates all required fields and data formats  
**Success Criteria**: 
- Asset name is not empty
- Category is selected
- All dates are valid (if provided)

### Step 2: Upload Metadata to IPFS
**Duration**: ~2 seconds  
**Action**: Uploads asset metadata and image to Pinata IPFS  
**Output**: IPFS hash (e.g., `QmX...`)  
**Metadata Structure**:
```json
{
  "name": "MacBook Pro 16",
  "description": "High-performance laptop",
  "category": "Computers",
  "serialNumber": "SN123456789",
  "attributes": [
    { "trait_type": "Category", "value": "Computers" },
    { "trait_type": "Manufacturer", "value": "Apple" },
    { "trait_type": "Model", "value": "MacBook Pro 2023" },
    { "trait_type": "Location", "value": "Office Floor 3" },
    { "trait_type": "Purchase Value", "value": "$2500" },
    { "trait_type": "Status", "value": "ACTIVE" }
  ],
  "image": "https://gateway.pinata.cloud/ipfs/Qm...",
  "properties": {
    "purchaseDate": "2025-01-15",
    "warrantyExpiry": "2028-01-15",
    "assignedTo": "John Doe"
  }
}
```

### Step 3: Connect Phantom Wallet
**Duration**: ~1.5 seconds  
**Action**: Connects to user's Phantom wallet  
**Requirements**: 
- Phantom wallet extension installed
- User approves connection
- Sufficient SOL for transaction (~0.00001 SOL)

### Step 4: Mint SPL Token on Solana
**Duration**: ~3 seconds  
**Action**: Creates unique SPL token on Solana devnet  
**Output**: 
- Transaction hash (Solana Explorer link)
- Mint address (unique identifier)
- Token account address

**Token Specifications**:
- **Decimals**: 0 (1 token = 1 asset)
- **Supply**: 1 (unique, non-fungible)
- **Standard**: SPL Token (Metaplex compatible)
- **Network**: Solana Devnet (for testing)

### Step 5: Record On-Chain Metadata
**Duration**: ~2 seconds  
**Action**: Links IPFS metadata to SPL token  
**Output**: Metadata account address  
**Recorded Data**:
- IPFS hash reference
- Asset status (ACTIVE)
- Creation timestamp
- Owner public key

### Step 6: Finalize Asset Registration
**Duration**: ~1 second  
**Action**: Generates asset ID and updates database  
**Output**: 
- Asset ID (e.g., `ASSET-123456`)
- Registration confirmation
- Success notification

---

## 🎉 Success View

After successful minting, users see:

### Blockchain Details Card
- **SPL Token Mint Address**: Link to Solana Explorer
- **IPFS Metadata Hash**: Link to IPFS Gateway
- **Asset Status**: Badge showing "ACTIVE"

### Next Steps Guidance
1. **View Asset Details**: Navigate to Assets page
2. **Log Maintenance**: Record maintenance activities
3. **Export Reports**: Generate CSV for compliance

### Action Buttons
- **Register Another Asset**: Clears form for new entry
- **Go to Assets**: Returns to Assets page

---

## 💡 Best Practices

### For Accurate Records
1. **Use Serial Numbers**: Always include manufacturer serial numbers
2. **Upload Photos**: Attach clear photos for visual identification
3. **Update Regularly**: Keep location and assignment current
4. **Document Warranties**: Track warranty expiry dates

### For Compliance
1. **Purchase Values**: Record accurate purchase costs
2. **Purchase Dates**: Maintain purchase date records
3. **Detailed Descriptions**: Add sufficient detail for audits
4. **Regular Exports**: Generate CSV reports monthly

### For Efficiency
1. **Bulk Import**: Use CSV import for multiple assets (coming soon)
2. **Templates**: Save common asset configurations
3. **Categories**: Use consistent category naming
4. **Locations**: Standardize location codes

---

## 🔗 Integration Points

### Blockchain Integration
```typescript
// Example: Mint Asset Function
async function mintAsset(metadata: AssetMetadata) {
  // 1. Upload to IPFS
  const ipfsHash = await uploadToIPFS(metadata);
  
  // 2. Connect wallet
  const wallet = await connectPhantom();
  
  // 3. Mint SPL token
  const mint = await createMint(
    connection,
    wallet,
    wallet.publicKey,
    null,
    0 // 0 decimals
  );
  
  // 4. Create metadata account
  await createMetadata(
    mint,
    ipfsHash,
    metadata.name,
    metadata.symbol || "ASSET"
  );
  
  return {
    mintAddress: mint.toBase58(),
    ipfsHash,
    transactionHash: tx.signature
  };
}
```

### IPFS Integration (Pinata)
```typescript
// Example: Upload to Pinata
async function uploadToPinata(data: any) {
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PINATA_JWT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pinataContent: data,
      pinataMetadata: {
        name: `asset-${Date.now()}`,
      },
    }),
  });
  
  const result = await response.json();
  return result.IpfsHash;
}
```

---

## 📊 Cost Breakdown

| Operation | Cost (SOL) | Cost (USD) | Notes |
|-----------|------------|------------|-------|
| Create Mint Account | 0.00144288 | ~$0.0003 | One-time per asset |
| Create Metadata | 0.0057 | ~$0.0012 | Metaplex metadata |
| Create Token Account | 0.00203928 | ~$0.0004 | Associated token account |
| **Total** | **~0.00918216** | **~$0.0019** | Per asset registration |

> **Note**: Costs are estimates on Solana devnet. Production costs may vary based on network congestion and SOL price.

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Wallet not connected"
**Solution**: 
- Install Phantom wallet extension
- Refresh page and try again
- Check wallet is unlocked

#### 2. "Insufficient SOL balance"
**Solution**:
- Get devnet SOL from faucet: https://faucet.solana.com
- Minimum required: 0.01 SOL

#### 3. "IPFS upload failed"
**Solution**:
- Check internet connection
- Verify Pinata API credentials
- Try smaller image size (<5MB)

#### 4. "Transaction timeout"
**Solution**:
- Wait for network confirmation
- Check Solana Explorer for status
- Retry if transaction failed

---

## 📚 Related Documentation

- [Solana SPL Token Documentation](https://spl.solana.com/token)
- [Metaplex Metadata Standard](https://docs.metaplex.com/)
- [Pinata IPFS API](https://docs.pinata.cloud/)
- [Phantom Wallet Integration](https://docs.phantom.app/)

---

## 🔐 Security Considerations

### Data Privacy
- **On-Chain Data**: Publicly visible on Solana blockchain
- **IPFS Data**: Publicly accessible via IPFS gateway
- **Sensitive Info**: Do NOT include PII or confidential data

### Access Control
- **Wallet Ownership**: Only wallet owner can mint
- **Asset Control**: Owner controls asset lifecycle
- **Metadata Immutability**: Once minted, metadata is permanent

### Best Practices
1. **Review Before Minting**: Double-check all data before submission
2. **Secure Wallet**: Keep seed phrase safe and private
3. **Backup Data**: Maintain local copy of asset records
4. **Regular Audits**: Verify on-chain data periodically

---

## 🚀 Future Enhancements

### Planned Features
- ✅ Basic asset registration
- ✅ IPFS metadata storage
- ✅ SPL token minting
- ⏳ Bulk import via CSV
- ⏳ QR code generation
- ⏳ Mobile app support
- ⏳ Asset transfer workflows
- ⏳ Maintenance scheduling
- ⏳ Depreciation tracking
- ⏳ Advanced reporting

---

## 📞 Support

For assistance with the Add Asset feature:
- **Documentation**: Check this guide first
- **Community**: Join our Discord server
- **Email**: support@solarwinds.example.com
- **GitHub Issues**: Report bugs on GitHub

---

**Last Updated**: October 28, 2025  
**Version**: 1.0.0
