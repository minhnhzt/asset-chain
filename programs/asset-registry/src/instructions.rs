use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;

use crate::state::*;
use crate::events::*;
use crate::AssetRegistryError;

/// Initialize maintenance log for an asset
#[derive(Accounts)]
pub struct InitializeMaintenanceLog<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 32 + (4 + MAX_MAINTENANCE_LOGS * 256) + 1,
        seeds = [b"maintenance_log", asset.key().as_ref()],
        bump
    )]
    pub maintenance_log: Account<'info, MaintenanceLog>,

    #[account(mut)]
    pub asset: Account<'info, Asset>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_maintenance_log_handler(
    ctx: Context<InitializeMaintenanceLog>,
) -> Result<()> {
    let maintenance_log = &mut ctx.accounts.maintenance_log;
    maintenance_log.asset = ctx.accounts.asset.key();
    maintenance_log.owner = ctx.accounts.owner.key();
    maintenance_log.entries = Vec::new();
    maintenance_log.bump = ctx.bumps.maintenance_log;

    let timestamp = Clock::get()?.unix_timestamp;

    emit!(MaintenanceLogInitialized {
        asset: ctx.accounts.asset.key(),
        owner: ctx.accounts.owner.key(),
        maintenance_log: maintenance_log.key(),
        timestamp,
    });

    Ok(())
}

/// Register a new asset on-chain
#[derive(Accounts)]
#[instruction(name: String)]
pub struct RegisterAsset<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + (4 + MAX_ASSET_NAME_LENGTH) + (4 + MAX_LOCATION_LENGTH) + (4 + MAX_IPFS_CID_LENGTH) + 1 + 8 + 8 + 1,
        seeds = [b"asset", owner.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub asset: Account<'info, Asset>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn register_asset_handler(
    ctx: Context<RegisterAsset>,
    name: String,
    location: String,
    metadata_cid: String,
) -> Result<()> {
    // Validate inputs
    require!(name.len() <= MAX_ASSET_NAME_LENGTH, AssetRegistryError::AssetNameTooLong);
    require!(
        location.len() <= MAX_LOCATION_LENGTH,
        AssetRegistryError::LocationTooLong
    );
    require!(
        metadata_cid.len() <= MAX_IPFS_CID_LENGTH,
        AssetRegistryError::IpfsCidTooLong
    );

    let asset = &mut ctx.accounts.asset;
    let timestamp = Clock::get()?.unix_timestamp;

    asset.owner = ctx.accounts.owner.key();
    asset.name = name.clone();
    asset.location = location.clone();
    asset.metadata_cid = metadata_cid.clone();
    asset.status = AssetStatus::Active;
    asset.created_at = timestamp;
    asset.updated_at = timestamp;
    asset.bump = ctx.bumps.asset;

    emit!(AssetRegistered {
        asset: asset.key(),
        owner: asset.owner,
        name,
        location,
        metadata_cid,
        timestamp,
    });

    Ok(())
}

/// Add a maintenance log entry
#[derive(Accounts)]
pub struct AddMaintenanceLog<'info> {
    #[account(
        mut,
        seeds = [b"maintenance_log", asset.key().as_ref()],
        bump = maintenance_log.bump
    )]
    pub maintenance_log: Account<'info, MaintenanceLog>,

    #[account(
        mut,
        constraint = asset.owner == owner.key() @ AssetRegistryError::Unauthorized
    )]
    pub asset: Account<'info, Asset>,

    pub owner: Signer<'info>,
    pub performer: Signer<'info>,
}

pub fn add_maintenance_log_handler(
    ctx: Context<AddMaintenanceLog>,
    note: String,
    ipfs_cid: String,
) -> Result<()> {
    // Validate inputs
    require!(
        note.len() <= MAX_MAINTENANCE_NOTE_LENGTH,
        AssetRegistryError::MaintenanceNoteTooLong
    );
    require!(
        ipfs_cid.len() <= MAX_IPFS_CID_LENGTH,
        AssetRegistryError::IpfsCidTooLong
    );

    let maintenance_log = &mut ctx.accounts.maintenance_log;

    // Check if log is full
    require!(
        maintenance_log.entries.len() < MAX_MAINTENANCE_LOGS,
        AssetRegistryError::MaintenanceLogFull
    );

    let timestamp = Clock::get()?.unix_timestamp;

    // Create new entry
    let entry = MaintenanceLogEntry {
        performer: ctx.accounts.performer.key(),
        note: note.clone(),
        timestamp,
        ipfs_cid: ipfs_cid.clone(),
    };

    maintenance_log.entries.push(entry);

    emit!(MaintenanceLogEntryAdded {
        asset: ctx.accounts.asset.key(),
        owner: ctx.accounts.owner.key(),
        performer: ctx.accounts.performer.key(),
        note,
        ipfs_cid,
        timestamp,
        entry_count: maintenance_log.entries.len() as u32,
    });

    Ok(())
}

/// Update asset metadata
#[derive(Accounts)]
pub struct UpdateAssetMetadata<'info> {
    #[account(
        mut,
        seeds = [b"asset", asset.owner.as_ref(), asset.name.as_bytes()],
        bump = asset.bump,
        constraint = asset.owner == owner.key() @ AssetRegistryError::Unauthorized
    )]
    pub asset: Account<'info, Asset>,

    pub owner: Signer<'info>,
}

pub fn update_asset_metadata_handler(
    ctx: Context<UpdateAssetMetadata>,
    new_metadata_cid: String,
) -> Result<()> {
    // Validate input
    require!(
        new_metadata_cid.len() <= MAX_IPFS_CID_LENGTH,
        AssetRegistryError::IpfsCidTooLong
    );

    let asset = &mut ctx.accounts.asset;
    let timestamp = Clock::get()?.unix_timestamp;

    asset.metadata_cid = new_metadata_cid.clone();
    asset.updated_at = timestamp;

    emit!(AssetMetadataUpdated {
        asset: asset.key(),
        owner: asset.owner,
        new_metadata_cid,
        timestamp,
    });

    Ok(())
}

/// Update asset status
#[derive(Accounts)]
pub struct UpdateAssetStatus<'info> {
    #[account(
        mut,
        seeds = [b"asset", asset.owner.as_ref(), asset.name.as_bytes()],
        bump = asset.bump,
        constraint = asset.owner == owner.key() @ AssetRegistryError::Unauthorized
    )]
    pub asset: Account<'info, Asset>,

    pub owner: Signer<'info>,
}

pub fn update_asset_status_handler(
    ctx: Context<UpdateAssetStatus>,
    new_status: u8,
) -> Result<()> {
    let asset = &mut ctx.accounts.asset;
    let old_status = asset.status as u8;
    let timestamp = Clock::get()?.unix_timestamp;

    asset.status = AssetStatus::from_u8(new_status)?;
    asset.updated_at = timestamp;

    emit!(AssetStatusChanged {
        asset: asset.key(),
        owner: asset.owner,
        old_status,
        new_status,
        timestamp,
    });

    Ok(())
}
