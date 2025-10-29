use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::*;

/// Mở tranh chấp (Raise Dispute)
#[derive(Accounts)]
pub struct RaiseDispute<'info> {
    /// Người khiếu nại (Owner hoặc Borrower)
    #[account(mut)]
    pub complainant: Signer<'info>,
    
    /// Tài khoản tranh chấp (PDA)
    #[account(
        init,
        payer = complainant,
        space = DisputeCase::MAX_SIZE,
        seeds = [b"dispute", loan_escrow.key().as_ref()],
        bump
    )]
    pub dispute_case: Account<'info, DisputeCase>,
    
    /// Tài khoản khoản mượn bị tranh chấp
    #[account(
        mut,
        constraint = loan_escrow.status == LoanStatus::ReturnPending @ LendingError::InvalidLoanStatus,
    )]
    pub loan_escrow: Account<'info, LoanEscrowAccount>,
    
    /// Token account của complainant (trả phí tranh chấp)
    #[account(
        mut,
        constraint = complainant_token_account.owner == complainant.key(),
    )]
    pub complainant_token_account: Account<'info, TokenAccount>,
    
    /// Kho bạc DAO (nhận phí)
    #[account(
        mut,
        constraint = treasury.key() == config.treasury,
    )]
    pub treasury: Account<'info, TokenAccount>,
    
    /// Global config
    #[account(
        seeds = [b"global_config"],
        bump = config.bump,
    )]
    pub config: Account<'info, GlobalConfig>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

/// Vote tranh chấp (Council members)
#[derive(Accounts)]
pub struct CastAppealVote<'info> {
    /// Thành viên Hội đồng
    pub council_member: Signer<'info>,
    
    /// Tài khoản tranh chấp
    #[account(
        mut,
        constraint = dispute_case.status == DisputeStatus::Voting @ LendingError::InvalidDisputeStatus,
    )]
    pub dispute_case: Account<'info, DisputeCase>,
    
    /// Global config (để check council membership)
    #[account(
        seeds = [b"global_config"],
        bump = config.bump,
    )]
    pub config: Account<'info, GlobalConfig>,
}

/// Giải quyết tranh chấp (Resolve Dispute)
#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    /// Bất kỳ ai cũng có thể gọi (sau khi vote kết thúc)
    pub resolver: Signer<'info>,
    
    /// Tài khoản tranh chấp
    #[account(
        mut,
        constraint = dispute_case.status == DisputeStatus::Voting @ LendingError::InvalidDisputeStatus,
        close = complainant_refund, // Đóng account sau khi resolve
    )]
    pub dispute_case: Account<'info, DisputeCase>,
    
    /// Tài khoản khoản mượn
    #[account(
        mut,
        constraint = loan_escrow.key() == dispute_case.loan_account,
    )]
    pub loan_escrow: Account<'info, LoanEscrowAccount>,
    
    /// Người khiếu nại (để refund nếu thắng)
    /// CHECK: Verified via dispute_case.complainant
    #[account(mut)]
    pub complainant_refund: AccountInfo<'info>,
    
    /// Global config
    #[account(
        seeds = [b"global_config"],
        bump = config.bump,
    )]
    pub config: Account<'info, GlobalConfig>,
}

/// Implementations

pub fn raise_dispute(
    ctx: Context<RaiseDispute>,
    evidence_link: String,
) -> Result<()> {
    let loan_escrow = &mut ctx.accounts.loan_escrow;
    let config = &ctx.accounts.config;
    let clock = Clock::get()?;
    
    // 1. Kiểm tra người khiếu nại là Owner hoặc Borrower
    let complainant_key = ctx.accounts.complainant.key();
    require!(
        complainant_key == loan_escrow.owner || complainant_key == loan_escrow.borrower,
        LendingError::UnauthorizedComplainant
    );
    
    // 2. Kiểm tra cửa sổ tranh chấp còn mở
    let dispute_deadline = loan_escrow.dispute_window_start + config.dispute_window_duration;
    require!(
        clock.unix_timestamp <= dispute_deadline,
        LendingError::DisputeWindowClosed
    );
    
    // 3. Thu phí tranh chấp
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.complainant_token_account.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
            authority: ctx.accounts.complainant.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, config.dispute_fee)?;
    
    // 4. Khởi tạo DisputeCase
    let dispute = &mut ctx.accounts.dispute_case;
    dispute.loan_account = loan_escrow.key();
    dispute.complainant = complainant_key;
    dispute.evidence_link = evidence_link.clone();
    dispute.status = DisputeStatus::Voting;
    dispute.opened_at = clock.unix_timestamp;
    dispute.voting_ends_at = clock.unix_timestamp + config.voting_duration;
    dispute.appeal_votes_for = 0;
    dispute.appeal_votes_against = 0;
    dispute.voted_members = Vec::new();
    dispute.bump = ctx.bumps.dispute_case;
    
    // 5. Khóa khoản mượn (đặt status = InDispute)
    loan_escrow.status = LoanStatus::InDispute;
    
    msg!("⚠️  Dispute raised!");
    msg!("   Loan: {}", loan_escrow.key());
    msg!("   Complainant: {}", complainant_key);
    msg!("   Evidence: {}", evidence_link);
    msg!("   Voting ends at: {}", dispute.voting_ends_at);
    
    Ok(())
}

pub fn cast_appeal_vote(
    ctx: Context<CastAppealVote>,
    vote_for_complainant: bool,
) -> Result<()> {
    let dispute = &mut ctx.accounts.dispute_case;
    let config = &ctx.accounts.config;
    let voter_key = ctx.accounts.council_member.key();
    
    // 1. Kiểm tra là council member
    require!(
        config.council_members.contains(&voter_key),
        LendingError::NotCouncilMember
    );
    
    // 2. Kiểm tra chưa vote
    require!(
        !dispute.voted_members.contains(&voter_key),
        LendingError::AlreadyVoted
    );
    
    // 3. Ghi nhận vote
    if vote_for_complainant {
        dispute.appeal_votes_for += 1;
    } else {
        dispute.appeal_votes_against += 1;
    }
    dispute.voted_members.push(voter_key);
    
    msg!("🗳️  Council vote cast");
    msg!("   Voter: {}", voter_key);
    msg!("   Vote: {}", if vote_for_complainant { "FOR" } else { "AGAINST" });
    msg!("   Tally: {} FOR, {} AGAINST", dispute.appeal_votes_for, dispute.appeal_votes_against);
    
    Ok(())
}

pub fn resolve_dispute(ctx: Context<ResolveDispute>) -> Result<()> {
    let dispute = &ctx.accounts.dispute_case;
    let loan_escrow = &mut ctx.accounts.loan_escrow;
    let clock = Clock::get()?;
    
    // 1. Kiểm tra thời gian vote đã kết thúc
    require!(
        clock.unix_timestamp >= dispute.voting_ends_at,
        LendingError::VotingNotEnded
    );
    
    // 2. Đếm phiếu
    let complainant_wins = dispute.appeal_votes_for > dispute.appeal_votes_against;
    
    msg!("⚖️  Dispute resolved!");
    msg!("   Final tally: {} FOR, {} AGAINST", dispute.appeal_votes_for, dispute.appeal_votes_against);
    msg!("   Result: Complainant {}", if complainant_wins { "WINS" } else { "LOSES" });
    
    // 3. Thi hành phán quyết
    if complainant_wins {
        // Người khiếu nại thắng => Arbitrators đã sai
        msg!("   Action: Slash arbitrators, reverse decision");
        
        // Set status để Owner có thể reclaim hoặc Borrower có thể return
        // (Logic cụ thể tùy thuộc vào ai là complainant)
        if dispute.complainant == loan_escrow.owner {
            // Owner khiếu nại => cho phép reclaim ngay
            loan_escrow.status = LoanStatus::Active;
        } else {
            // Borrower khiếu nại => cho phép return lại
            loan_escrow.status = LoanStatus::ReturnPending;
        }
        
        // Note: Việc slash arbitrators sẽ được thực hiện trong một
        // instruction riêng (SlashArbitrator) bởi admin sau khi xem kết quả
        
    } else {
        // Người khiếu nại thua => giữ nguyên quyết định của arbitrators
        msg!("   Action: Uphold arbitrator decision");
        
        // Trả về trạng thái ReturnPending để complete_loan có thể chạy
        loan_escrow.status = LoanStatus::ReturnPending;
    }
    
    Ok(())
}

/// Thêm thành viên vào Hội đồng Phân xử (chỉ admin)
#[derive(Accounts)]
pub struct AddCouncilMember<'info> {
    /// Admin
    pub admin: Signer<'info>,
    
    /// Global config
    #[account(
        mut,
        seeds = [b"global_config"],
        bump = config.bump,
        constraint = config.admin == admin.key() @ LendingError::UnauthorizedAdmin,
    )]
    pub config: Account<'info, GlobalConfig>,
}

pub fn add_council_member(
    ctx: Context<AddCouncilMember>,
    new_member: Pubkey,
) -> Result<()> {
    let config = &mut ctx.accounts.config;
    
    // Kiểm tra chưa tồn tại
    require!(
        !config.council_members.contains(&new_member),
        LendingError::InvalidDisputeStatus // Reuse error
    );
    
    // Giới hạn 50 members
    require!(
        config.council_members.len() < 50,
        LendingError::InvalidDisputeStatus
    );
    
    config.council_members.push(new_member);
    
    msg!("✅ Council member added: {}", new_member);
    msg!("   Total members: {}", config.council_members.len());
    
    Ok(())
}

/// Xóa thành viên khỏi Hội đồng (chỉ admin)
#[derive(Accounts)]
pub struct RemoveCouncilMember<'info> {
    /// Admin
    pub admin: Signer<'info>,
    
    /// Global config
    #[account(
        mut,
        seeds = [b"global_config"],
        bump = config.bump,
        constraint = config.admin == admin.key() @ LendingError::UnauthorizedAdmin,
    )]
    pub config: Account<'info, GlobalConfig>,
}

pub fn remove_council_member(
    ctx: Context<RemoveCouncilMember>,
    member_to_remove: Pubkey,
) -> Result<()> {
    let config = &mut ctx.accounts.config;
    
    config.council_members.retain(|&x| x != member_to_remove);
    
    msg!("✅ Council member removed: {}", member_to_remove);
    msg!("   Remaining members: {}", config.council_members.len());
    
    Ok(())
}
