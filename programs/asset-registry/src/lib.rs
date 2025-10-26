use anchor_lang::prelude::*;

mod accounts;
mod events;
mod instructions;

use accounts::*;
use instructions::*;

declare_id!("DT9SMSBTL361VytU1SD2k41Kk13sXRjR59QYg15yhzST");

#[program]
pub mod asset_registry {
    use super::*;

    /// Register a new asset with metadata
    pub fn register_asset(
        ctx: Context<RegisterAsset>,
        name: String,
        location: String,
        metadata_cid: String,
    ) -> Result<()> {
        register_asset_handler(ctx, name, location, metadata_cid)
    }

    /// Initialize maintenance log for an asset
    pub fn initialize_maintenance_log(ctx: Context<InitializeMaintenanceLog>) -> Result<()> {
        initialize_maintenance_log_handler(ctx)
    }

    /// Add a maintenance log entry to an asset
    pub fn add_maintenance_log(
        ctx: Context<AddMaintenanceLog>,
        note: String,
        ipfs_cid: String,
    ) -> Result<()> {
        add_maintenance_log_handler(ctx, note, ipfs_cid)
    }

    /// Update asset metadata (IPFS CID only)
    pub fn update_asset_metadata(
        ctx: Context<UpdateAssetMetadata>,
        new_metadata_cid: String,
    ) -> Result<()> {
        update_asset_metadata_handler(ctx, new_metadata_cid)
    }

    /// Update asset status (ACTIVE, MAINTENANCE, RETIRED, DISPOSED)
    pub fn update_asset_status(ctx: Context<UpdateAssetStatus>, new_status: u8) -> Result<()> {
        update_asset_status_handler(ctx, new_status)
    }
}

#[error_code]
pub enum AssetRegistryError {
    #[msg("Unauthorized: Only asset owner can perform this action")]
    Unauthorized,
    #[msg("Maintenance note exceeds maximum length of 256 characters")]
    MaintenanceNoteTooLong,
    #[msg("IPFS CID exceeds maximum length of 256 characters")]
    IpfsCidTooLong,
    #[msg("Maintenance log is full (maximum 50 entries)")]
    MaintenanceLogFull,
    #[msg("Asset name exceeds maximum length of 128 characters")]
    AssetNameTooLong,
    #[msg("Location exceeds maximum length of 256 characters")]
    LocationTooLong,
}
