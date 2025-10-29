# 🔐 NFT Asset Lending & Recovery Program

## Tổng quan

Chương trình **Asset Lending** cho phép quản lý việc **cho mượn** và **thu hồi** tài sản NFT một cách an toàn và phi tín nhiệm (trustless) trên Solana blockchain.

### Đặc điểm chính

✅ **Mô hình Escrow (Ký quỹ)** - NFT được giữ trong PDA, không chuyển trực tiếp cho người mượn  
✅ **Phi tín nhiệm (Trustless)** - Smart contract tự động thực thi, không cần bên thứ 3  
✅ **Quản lý thời gian** - Tự động kiểm tra hạn mượn dựa trên blockchain timestamp  
✅ **4 Instructions đầy đủ** - Lend, Return, Reclaim, Revoke  
✅ **Tích hợp NFT Standards** - Hỗ trợ Metaplex Token Metadata  
✅ **Audit Trail** - Events chi tiết cho mọi hành động  

---

## Kiến trúc

### Account Structure

```rust
#[account]
pub struct LoanEscrowAccount {
    pub owner: Pubkey,           // Chủ sở hữu (cho mượn)
    pub borrower: Pubkey,        // Người mượn
    pub asset_mint: Pubkey,      // NFT mint address
    pub loan_start_time: i64,    // Thời gian bắt đầu
    pub loan_end_time: i64,      // Thời gian kết thúc
    pub status: LoanStatus,      // Trạng thái khoản mượn
    pub bump: u8,                // PDA bump seed
}
```

**PDA Seeds:** `["loan_escrow", owner, asset_mint]`

### Loan Status

```rust
pub enum LoanStatus {
    Active,      // Đang hoạt động
    Returned,    // Đã hoàn trả
    Reclaimed,   // Đã thu hồi
    Revoked,     // Đã hủy bỏ
}
```

---

## 4 Instructions (Quy trình nghiệp vụ)

### 1️⃣ Lend Asset (Cho mượn tài sản)

**Người gọi:** Owner (Chủ sở hữu)

**Quy trình:**
1. Tạo `LoanEscrowAccount` (PDA)
2. Tạo `escrow_token_account` (ATA của PDA)
3. Transfer NFT từ Owner → PDA Escrow
4. Ghi nhận thông tin: borrower, thời gian, trạng thái

**Input:**
- `borrower: Pubkey` - Địa chỉ người mượn
- `loan_duration_seconds: i64` - Thời gian mượn (1 giờ - 1 năm)

**Kiểm tra:**
- NFT phải có `supply = 1` và `decimals = 0`
- Owner phải có đủ 1 NFT trong token account
- Loan duration hợp lệ (3600s - 31536000s)

**Event:** `AssetLendedEvent`

---

### 2️⃣ Return Asset (Hoàn trả tài sản)

**Người gọi:** Borrower (Người mượn)

**Quy trình:**
1. Xác thực người gọi = `loan_escrow.borrower`
2. Transfer NFT từ PDA Escrow → Owner
3. Đóng `escrow_token_account` (hoàn SOL cho Owner)
4. Đóng `loan_escrow` (hoàn SOL cho Owner)

**Điều kiện:**
- Chỉ Borrower mới được gọi
- Khoản mượn ở trạng thái `Active`
- **Có thể trả sớm** (không cần đợi hết hạn)

**Event:** `AssetReturnedEvent`

---

### 3️⃣ Reclaim Asset (Thu hồi tài sản)

**Người gọi:** Owner (Chủ sở hữu)

**Quy trình:**
1. Xác thực người gọi = `loan_escrow.owner`
2. **Kiểm tra thời gian:** `Clock::unix_timestamp > loan_end_time` ⚠️
3. Transfer NFT từ PDA Escrow → Owner
4. Đóng các accounts liên quan

**Điều kiện:**
- Chỉ Owner mới được gọi
- Khoản mượn ở trạng thái `Active`
- **Chỉ được gọi SAU KHI hết hạn**

**Event:** `AssetReclaimedEvent` (bao gồm `overdue_by`)

---

### 4️⃣ Revoke Loan (Hủy khoản mượn)

**Người gọi:** Owner (Chủ sở hữu)

**Quy trình:**
1. Xác thực người gọi = `loan_escrow.owner`
2. Transfer NFT từ PDA Escrow → Owner
3. Đóng các accounts liên quan

**Điều kiện:**
- Chỉ Owner mới được gọi
- Khoản mượn ở trạng thái `Active`
- **Có thể gọi BẤT CỨ LÚC NÀO** (không cần đợi hết hạn)

**Use case:** Trường hợp khẩn cấp, tranh chấp, hoặc thay đổi kế hoạch

**Event:** `LoanRevokedEvent`

---

## Tại sao sử dụng PDA Escrow?

### 🔒 An toàn hơn chuyển trực tiếp cho Borrower

| Khía cạnh | Chuyển trực tiếp | PDA Escrow (✅ Lựa chọn) |
|-----------|------------------|--------------------------|
| **Quyền sở hữu** | Borrower có quyền 100% | PDA giữ NFT, không ai có private key |
| **Kiểm soát** | Borrower có thể bán/transfer | Chỉ program có thể transfer |
| **Thu hồi** | Cần tin tưởng Borrower | Tự động theo smart contract |
| **Tranh chấp** | Khó giải quyết | Logic rõ ràng trong code |
| **Trustless** | ❌ Cần tin tưởng | ✅ Phi tín nhiệm hoàn toàn |

### Lợi ích cụ thể:

1. **Bảo vệ Owner:**
   - NFT không thể bị Borrower bán hoặc chuyển đi
   - Owner chắc chắn lấy lại sau khi hết hạn
   - Có thể revoke nếu cần thiết

2. **Minh bạch cho Borrower:**
   - Điều khoản rõ ràng (thời gian, quyền lợi)
   - Có thể return sớm nếu muốn
   - Không lo bị chiếm đoạt NFT

3. **Tự động hóa:**
   - Không cần bên thứ 3 làm trọng tài
   - Smart contract tự động thực thi theo logic
   - Blockchain timestamp đảm bảo thời gian chính xác

4. **Audit Trail:**
   - Mọi hành động được ghi lại bằng events
   - Có thể truy vết toàn bộ lịch sử
   - Phù hợp với yêu cầu compliance

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         LEND ASSET                              │
│  Owner → [Create PDA Escrow] → [Transfer NFT to PDA]           │
│           ↓                                                      │
│        LoanEscrowAccount (Active)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├──────────────┬──────────────┐
                              ↓              ↓              ↓
┌──────────────────────┐  ┌────────────┐  ┌────────────┐
│   RETURN ASSET       │  │  RECLAIM   │  │   REVOKE   │
│  (Borrower calls)    │  │  (Owner)   │  │  (Owner)   │
│  ✅ Anytime          │  │  ⏰ After  │  │  ⚡ Anytime │
│                      │  │   deadline │  │            │
│  NFT → Owner         │  │  NFT →     │  │  NFT →     │
│  Close accounts      │  │   Owner    │  │   Owner    │
└──────────────────────┘  └────────────┘  └────────────┘
```

---

## Integration với Asset Manager

### Kết nối với hệ thống hiện tại

```typescript
// 1. Register Asset (asset-registry program)
const assetMint = await registerAsset({
  name: "Equipment A",
  location: "Building 1",
  metadataCid: "QmXxx..."
});

// 2. Lend Asset (asset-lending program - NEW)
const loanEscrow = await lendAsset({
  assetMint,
  borrower: borrowerWallet,
  durationDays: 30
});

// 3. Track status in dashboard
const status = await getLoanStatus(loanEscrow);
// → { active: true, endTime: "2025-11-27", borrower: "..." }

// 4. Return or Reclaim
if (isBorrower) {
  await returnAsset(loanEscrow);
} else if (isExpired) {
  await reclaimAsset(loanEscrow);
}
```

### Workflow tích hợp

1. **Asset Registration** → Tạo NFT trong `asset-registry`
2. **Lend Asset** → Chuyển vào escrow trong `asset-lending`
3. **Dashboard** → Hiển thị trạng thái mượn/trả
4. **Return/Reclaim** → Kết thúc khoản mượn
5. **Maintenance Log** → Ghi nhận lịch sử trong `asset-registry`

---

## Error Codes

```rust
#[error_code]
pub enum LendingError {
    InvalidLoanDuration,      // 0x1770: Thời gian không hợp lệ
    LoanNotExpired,           // 0x1771: Chưa hết hạn
    UnauthorizedOwner,        // 0x1772: Không phải Owner
    UnauthorizedBorrower,     // 0x1773: Không phải Borrower
    InvalidTokenAccount,      // 0x1774: Token account sai
    NotNFT,                   // 0x1775: Không phải NFT
    InsufficientTokens,       // 0x1776: Không đủ tokens
    MathOverflow,             // 0x1777: Lỗi tính toán
    LoanNotActive,            // 0x1778: Khoản mượn không active
}
```

---

## Build & Deploy

### Build program

```bash
# Build asset-lending program
anchor build -p asset-lending

# Check program ID
solana address -k target/deploy/asset_lending-keypair.json

# Update lib.rs với program ID mới
declare_id!("YOUR_PROGRAM_ID");
```

### Deploy to devnet

```bash
# Deploy
anchor deploy --program-name asset-lending --provider.cluster devnet

# Verify
solana program show YOUR_PROGRAM_ID --url devnet
```

### Test

```bash
# Run tests
anchor test --skip-local-validator

# Expected: 8+ test cases pass
# - Lend asset successfully
# - Return asset by borrower
# - Reclaim asset after expiry
# - Revoke loan by owner
# - Error: Reclaim before expiry
# - Error: Unauthorized borrower
# - Error: Not NFT
# - Error: Invalid duration
```

---

## Frontend Integration

### TypeScript Client Example

```typescript
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';

// Lend Asset
async function lendAsset(
  program: Program,
  owner: Keypair,
  borrower: PublicKey,
  assetMint: PublicKey,
  durationDays: number
) {
  const [loanEscrow] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('loan_escrow'),
      owner.publicKey.toBuffer(),
      assetMint.toBuffer()
    ],
    program.programId
  );

  const ownerTokenAccount = await getAssociatedTokenAddress(
    assetMint,
    owner.publicKey
  );

  const escrowTokenAccount = await getAssociatedTokenAddress(
    assetMint,
    loanEscrow,
    true
  );

  const tx = await program.methods
    .lendAsset(borrower, durationDays * 86400)
    .accounts({
      owner: owner.publicKey,
      loanEscrow,
      assetMint,
      ownerTokenAccount,
      escrowTokenAccount,
    })
    .signers([owner])
    .rpc();

  console.log('✅ Asset lended:', tx);
  return { loanEscrow, tx };
}

// Return Asset
async function returnAsset(
  program: Program,
  borrower: Keypair,
  loanEscrow: PublicKey
) {
  const escrowData = await program.account.loanEscrowAccount.fetch(loanEscrow);
  
  const ownerTokenAccount = await getAssociatedTokenAddress(
    escrowData.assetMint,
    escrowData.owner
  );

  const escrowTokenAccount = await getAssociatedTokenAddress(
    escrowData.assetMint,
    loanEscrow,
    true
  );

  const tx = await program.methods
    .returnAsset()
    .accounts({
      borrower: borrower.publicKey,
      owner: escrowData.owner,
      loanEscrow,
      escrowTokenAccount,
      ownerTokenAccount,
    })
    .signers([borrower])
    .rpc();

  console.log('✅ Asset returned:', tx);
  return tx;
}

// Reclaim Asset (after expiry)
async function reclaimAsset(
  program: Program,
  owner: Keypair,
  loanEscrow: PublicKey
) {
  const escrowData = await program.account.loanEscrowAccount.fetch(loanEscrow);
  
  const ownerTokenAccount = await getAssociatedTokenAddress(
    escrowData.assetMint,
    owner.publicKey
  );

  const escrowTokenAccount = await getAssociatedTokenAddress(
    escrowData.assetMint,
    loanEscrow,
    true
  );

  const tx = await program.methods
    .reclaimAsset()
    .accounts({
      owner: owner.publicKey,
      loanEscrow,
      escrowTokenAccount,
      ownerTokenAccount,
    })
    .signers([owner])
    .rpc();

  console.log('✅ Asset reclaimed:', tx);
  return tx;
}
```

---

## Security Considerations

### ✅ Đã implement

1. **PDA Authority:** PDA không có private key, chỉ program mới có thể sign
2. **Time Checks:** Sử dụng `Clock::get().unix_timestamp` từ blockchain
3. **Owner/Borrower Validation:** Kiểm tra chặt chẽ quyền truy cập
4. **NFT Validation:** Đảm bảo supply = 1, decimals = 0
5. **Account Constraints:** Anchor constraints kiểm tra tất cả accounts
6. **Close Accounts:** Hoàn SOL khi đóng accounts

### ⚠️ Cần lưu ý

1. **Front-running:** Borrower có thể return ngay trước khi Owner revoke
2. **Multiple Loans:** Mỗi asset chỉ có thể có 1 loan active (do PDA seeds)
3. **Metadata Changes:** NFT metadata có thể thay đổi trong thời gian mượn
4. **Rent Exemption:** Cần đủ SOL để tạo accounts

---

## Cost Analysis

| Operation | Accounts Created | Size | Rent (SOL) | Transaction Fee |
|-----------|------------------|------|------------|-----------------|
| **Lend Asset** | 2 (PDA + Token) | 122 + 165 bytes | ~0.003 | 0.00005 |
| **Return Asset** | 0 (close 2) | - | ✅ Refund ~0.003 | 0.00005 |
| **Reclaim Asset** | 0 (close 2) | - | ✅ Refund ~0.003 | 0.00005 |
| **Revoke Loan** | 0 (close 2) | - | ✅ Refund ~0.003 | 0.00005 |

**Total cost per loan cycle:** ~0.0001 SOL (~$0.005 USD)

---

## Roadmap

### Phase 1 (Current) ✅
- [x] Core 4 instructions
- [x] PDA escrow mechanism
- [x] Time-based logic
- [x] Events & error handling

### Phase 2 (Q1 2026)
- [ ] Multiple concurrent loans per asset
- [ ] Loan extension mechanism
- [ ] Late fee calculation
- [ ] Collateral requirements

### Phase 3 (Q2 2026)
- [ ] Partial ownership loans
- [ ] Loan marketplace
- [ ] Reputation system
- [ ] Insurance integration

---

## Support

📧 Email: support@assetmanager.sol  
📖 Docs: [Full documentation](./docs/LENDING_GUIDE.md)  
🐛 Issues: [GitHub Issues](https://github.com/minhnhzt/asset-chain/issues)

---

**Built with 🔐 on Solana | Oct 2025**
