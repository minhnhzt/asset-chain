use anchor_lang::prelude::*;

#[error_code]
pub enum LendingError {
    #[msg("Thời gian cho mượn không hợp lệ (phải từ 1 giờ đến 1 năm)")]
    InvalidLoanDuration,
    
    #[msg("Khoản mượn chưa hết hạn, không thể thu hồi")]
    LoanNotExpired,
    
    #[msg("Chỉ chủ sở hữu mới có quyền thực hiện hành động này")]
    UnauthorizedOwner,
    
    #[msg("Chỉ người mượn mới có quyền trả lại tài sản")]
    UnauthorizedBorrower,
    
    #[msg("Token account không hợp lệ")]
    InvalidTokenAccount,
    
    #[msg("Số lượng token không đủ")]
    InsufficientTokens,
    
    #[msg("Token không phải là NFT (supply phải = 1, decimals = 0)")]
    NotNFT,
    
    #[msg("Trạng thái khoản mượn không hợp lệ cho hành động này")]
    InvalidLoanStatus,
    
    #[msg("Tài khoản khoản mượn không tồn tại")]
    LoanNotFound,
    
    #[msg("Phép tính toán học bị overflow")]
    MathOverflow,
    
    #[msg("Khoản mượn không còn ở trạng thái Active")]
    LoanNotActive,
    
    // --- Arbitrator Errors ---
    
    #[msg("Số tiền stake không đủ tối thiểu")]
    InsufficientStake,
    
    #[msg("Giám định viên không hoạt động")]
    ArbitratorNotActive,
    
    #[msg("Giám định viên không nằm trong danh sách được chỉ định")]
    ArbitratorNotInSet,
    
    #[msg("Giám định viên đã xác nhận rồi")]
    AlreadyApproved,
    
    #[msg("Chưa đủ số lượng xác nhận cần thiết")]
    InsufficientApprovals,
    
    #[msg("Không có quyền slash arbitrator")]
    UnauthorizedSlash,
    
    // --- Dispute Errors ---
    
    #[msg("Cửa sổ tranh chấp đã đóng")]
    DisputeWindowClosed,
    
    #[msg("Tranh chấp đang được xử lý cho khoản mượn này")]
    DisputeAlreadyExists,
    
    #[msg("Chỉ Owner hoặc Borrower mới có quyền khiếu nại")]
    UnauthorizedComplainant,
    
    #[msg("Không phải thành viên Hội đồng Phân xử")]
    NotCouncilMember,
    
    #[msg("Đã vote rồi")]
    AlreadyVoted,
    
    #[msg("Thời gian vote chưa kết thúc")]
    VotingNotEnded,
    
    #[msg("Tranh chấp chưa ở trạng thái phù hợp")]
    InvalidDisputeStatus,
    
    // --- Config Errors ---
    
    #[msg("Chỉ admin mới có quyền thực hiện")]
    UnauthorizedAdmin,
    
    #[msg("Cấu hình toàn cục chưa được khởi tạo")]
    ConfigNotInitialized,
}
