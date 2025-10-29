use anchor_lang::prelude::*;

/// Trạng thái của khoản mượn
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum LoanStatus {
    /// Khoản mượn đang hoạt động
    Active = 0,
    /// Borrower đã bắt đầu quá trình trả lại, chờ arbitrator xác nhận
    ReturnPending = 1,
    /// Đã hoàn thành (arbitrators đã xác nhận)
    Completed = 2,
    /// Đang trong quá trình tranh chấp
    InDispute = 3,
    /// Đã hủy bởi hệ thống hoặc admin
    Cancelled = 4,
    /// Đã được trả lại (legacy - for backward compatibility with return_asset)
    Returned = 5,
    /// Đã được thu hồi bởi owner sau khi hết hạn (legacy - for backward compatibility with reclaim_asset)
    Reclaimed = 6,
    /// Đã bị thu hồi sớm bởi owner (legacy - for backward compatibility with revoke_loan)
    Revoked = 7,
}

/// Trạng thái của tranh chấp
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum DisputeStatus {
    Open = 0,
    Voting = 1,
    Resolved = 2,
}

/// Hồ sơ Giám định viên (Arbitrator)
/// PDA seeds: ["arbitrator", authority]
#[account]
pub struct ArbitratorProfile {
    /// Ví của giám định viên
    pub authority: Pubkey,
    
    /// Địa chỉ vault chứa tiền stake (USDC)
    pub stake_vault: Pubkey,
    
    /// Số tiền đã stake (đơn vị: lamports hoặc token units)
    pub stake_amount: u64,
    
    /// Trạng thái hoạt động
    pub is_active: bool,
    
    /// Điểm uy tín (tăng khi xác nhận đúng, giảm khi bị slash)
    pub reputation_score: u64,
    
    /// Số lần xác nhận thành công
    pub verified_count: u64,
    
    /// Số lần bị slash
    pub slashed_count: u64,
    
    /// Bump seed cho PDA
    pub bump: u8,
}

impl ArbitratorProfile {
    pub const SIZE: usize = 8 + // discriminator
        32 + // authority
        32 + // stake_vault
        8 +  // stake_amount
        1 +  // is_active
        8 +  // reputation_score
        8 +  // verified_count
        8 +  // slashed_count
        1;   // bump
}

/// Tài khoản khoản mượn (LoanEscrow) - Enhanced với M-of-N
/// PDA seeds: ["loan_escrow", owner, asset_mint]
#[account]
pub struct LoanEscrowAccount {
    /// Chủ sở hữu tài sản (người cho mượn)
    pub owner: Pubkey,
    
    /// Người mượn
    pub borrower: Pubkey,
    
    /// Mint address của NFT
    pub asset_mint: Pubkey,
    
    /// Thời điểm bắt đầu cho mượn (Unix timestamp)
    pub loan_start_time: i64,
    
    /// Thời điểm hết hạn (Unix timestamp)
    pub loan_end_time: i64,
    
    /// Trạng thái khoản mượn
    pub status: LoanStatus,
    
    /// --- M-of-N Oracle System ---
    
    /// Danh sách N giám định viên được chỉ định (tối đa 10)
    pub arbitrator_set: Vec<Pubkey>,
    
    /// Số lượng xác nhận cần thiết M (ví dụ: 3/5)
    pub required_approvals: u8,
    
    /// Danh sách giám định viên đã xác nhận "OK"
    pub approvals: Vec<Pubkey>,
    
    /// Thời gian bắt đầu cửa sổ tranh chấp (sau lần verify đầu tiên)
    pub dispute_window_start: i64,
    
    /// Bump seed
    pub bump: u8,
}

impl LoanEscrowAccount {
    // Dynamic size: base + Vec sizes
    pub const BASE_SIZE: usize = 8 + // discriminator
        32 + // owner
        32 + // borrower
        32 + // asset_mint
        8 +  // loan_start_time
        8 +  // loan_end_time
        1 +  // status
        4 +  // arbitrator_set Vec length prefix
        1 +  // required_approvals
        4 +  // approvals Vec length prefix
        8 +  // dispute_window_start
        1;   // bump
    
    // Max size: base + max Vec elements (10 arbitrators + 10 approvals)
    pub const MAX_SIZE: usize = Self::BASE_SIZE + (10 * 32) + (10 * 32);
    
    // Legacy SIZE for backward compatibility (without Vec fields)
    pub const SIZE: usize = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 1;
}

/// Vụ tranh chấp (Dispute Case)
/// PDA seeds: ["dispute", loan_account]
#[account]
pub struct DisputeCase {
    /// Tài khoản khoản mượn đang bị tranh chấp
    pub loan_account: Pubkey,
    
    /// Người khiếu nại (Owner hoặc Borrower)
    pub complainant: Pubkey,
    
    /// Link đến bằng chứng (IPFS, Arweave, max 200 chars)
    pub evidence_link: String,
    
    /// Trạng thái tranh chấp
    pub status: DisputeStatus,
    
    /// Thời gian mở tranh chấp
    pub opened_at: i64,
    
    /// Thời gian kết thúc vote
    pub voting_ends_at: i64,
    
    /// --- Voting từ Hội đồng Phân xử ---
    
    /// Số phiếu ủng hộ người khiếu nại
    pub appeal_votes_for: u16,
    
    /// Số phiếu chống lại người khiếu nại
    pub appeal_votes_against: u16,
    
    /// Danh sách thành viên đã vote (tối đa 50)
    pub voted_members: Vec<Pubkey>,
    
    /// Bump seed
    pub bump: u8,
}

impl DisputeCase {
    pub const BASE_SIZE: usize = 8 + // discriminator
        32 + // loan_account
        32 + // complainant
        4 + 200 + // evidence_link (String with max 200 chars)
        1 +  // status
        8 +  // opened_at
        8 +  // voting_ends_at
        2 +  // appeal_votes_for
        2 +  // appeal_votes_against
        4 +  // voted_members vec length
        1;   // bump
    
    // Max 50 council members
    pub const MAX_SIZE: usize = Self::BASE_SIZE + (50 * 32);
}

/// Cấu hình toàn cục (Global Config)
/// PDA seeds: ["global_config"]
#[account]
pub struct GlobalConfig {
    /// Admin có quyền thay đổi config
    pub admin: Pubkey,
    
    /// Số tiền stake tối thiểu để trở thành arbitrator (USDC)
    pub min_stake_amount: u64,
    
    /// Địa chỉ kho bạc DAO (nhận tiền slash)
    pub treasury: Pubkey,
    
    /// Phí khiếu nại (để chống spam)
    pub dispute_fee: u64,
    
    /// Thời gian cửa sổ tranh chấp (giây) - ví dụ: 86400 = 24 giờ
    pub dispute_window_duration: i64,
    
    /// Thời gian vote tranh chấp (giây) - ví dụ: 172800 = 48 giờ
    pub voting_duration: i64,
    
    /// Danh sách Hội đồng Phân xử (whitelist, max 50 members)
    pub council_members: Vec<Pubkey>,
    
    /// Bump seed
    pub bump: u8,
}

impl GlobalConfig {
    pub const BASE_SIZE: usize = 8 + // discriminator
        32 + // admin
        8 +  // min_stake_amount
        32 + // treasury
        8 +  // dispute_fee
        8 +  // dispute_window_duration
        8 +  // voting_duration
        4 +  // council_members vec length
        1;   // bump
    
    // Max 50 council members
    pub const MAX_SIZE: usize = Self::BASE_SIZE + (50 * 32);
}
